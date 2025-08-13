"use server"; // Ensure server-only execution

// Prevent accidental browser imports
if (typeof window !== "undefined") {
  throw new Error("google-drive.ts can only be used on the server");
}

import { google } from "googleapis";
import { Readable } from "stream";

let GOOGLE_SERVICE_ACCOUNT: Record<string, any> = {};
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
} catch (err) {
  console.warn("Invalid GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
}

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || "";

export async function initializeDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

export async function createUserFolder(
  drive: any,
  userEmail: string,
  type: "workout" | "diet"
): Promise<string> {
  try {
    const userFolderName = `${userEmail.split("@")[0]}_logs`;

    const userFolderSearch = await drive.files.list({
      q: `name='${userFolderName}' and parents='${DRIVE_FOLDER_ID}' and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    let userFolderId: string;
    if (userFolderSearch.data.files.length > 0) {
      userFolderId = userFolderSearch.data.files[0].id;
    } else {
      const userFolderResponse = await drive.files.create({
        requestBody: {
          name: userFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [DRIVE_FOLDER_ID],
        },
      });
      userFolderId = userFolderResponse.data.id;
    }

    const typeFolderName = type === "workout" ? "Workouts" : "Meals";

    const typeFolderSearch = await drive.files.list({
      q: `name='${typeFolderName}' and parents='${userFolderId}' and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    let typeFolderId: string;
    if (typeFolderSearch.data.files.length > 0) {
      typeFolderId = typeFolderSearch.data.files[0].id;
    } else {
      const typeFolderResponse = await drive.files.create({
        requestBody: {
          name: typeFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [userFolderId],
        },
      });
      typeFolderId = typeFolderResponse.data.id;
    }

    return typeFolderId;
  } catch (error) {
    console.error("Error creating user folder:", error);
    throw new Error("Failed to create user folder structure");
  }
}

export async function uploadImageToDrive(
  imageBuffer: Buffer,
  fileName: string,
  userEmail: string,
  type: "workout" | "diet",
  title?: string
): Promise<{ fileId: string; webViewLink: string; directLink: string }> {
  const drive = await initializeDriveClient();

  try {
    const parentFolderId = await createUserFolder(drive, userEmail, type);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uniqueFileName = `${timestamp}_${fileName}`;

    let uploadResponse;
    let retries = 3;

    while (retries > 0) {
      try {
        uploadResponse = await drive.files.create({
          requestBody: {
            name: uniqueFileName,
            parents: [parentFolderId],
            description: title
              ? `KN0X-FIT ${type} log: ${title}`
              : `KN0X-FIT ${type} log`,
          },
          media: {
            mimeType: "image/jpeg",
            // Wrap Buffer in Readable for Google API
            body: Readable.from(imageBuffer),
          },
          fields: "id, webViewLink, parents",
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const fileId = uploadResponse.data.id!;

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    const file = await drive.files.get({
      fileId,
      fields: "webViewLink, webContentLink",
    });

    const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return {
      fileId,
      webViewLink: file.data.webViewLink!,
      directLink,
    };
  } catch (error) {
    console.error("Google Drive upload error:", error);
    throw new Error(
      `Failed to upload to Google Drive: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getFileInfo(
  fileId: string
): Promise<{ name: string; size: string; createdTime: string }> {
  const drive = await initializeDriveClient();

  try {
    const file = await drive.files.get({
      fileId,
      fields: "name, size, createdTime",
    });

    return {
      name: file.data.name || "Unknown",
      size: file.data.size
        ? `${Math.round(Number(file.data.size) / 1024)} KB`
        : "Unknown",
      createdTime: file.data.createdTime || "",
    };
  } catch (error) {
    console.error("Error getting file info:", error);
    throw new Error("Failed to get file information");
  }
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = await initializeDriveClient();

  try {
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file from Google Drive");
  }
}
