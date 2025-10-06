// Google Sheets API integration
import { ensureAuth } from "./auth";
import type { JobApplication } from "../../lib/storage/schema";

export async function exportApplicationTracker(applications: JobApplication[]): Promise<string> {
  const token = await ensureAuth();

  // Create spreadsheet
  const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: `Job Applications - ${new Date().toLocaleDateString()}`,
      },
      sheets: [
        {
          properties: {
            title: "Applications",
          },
        },
      ],
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(`Failed to create spreadsheet: ${error.error?.message || createResponse.statusText}`);
  }

  const spreadsheet = await createResponse.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // Prepare data
  const headers = [
    "Job Title",
    "Company",
    "Status",
    "Location",
    "Salary",
    "Job Type",
    "Application Date",
    "Deadline",
    "Priority",
    "Notes",
    "URL",
  ];

  const rows = applications.map((app) => [
    app.jobTitle,
    app.company,
    app.status,
    app.location || "",
    app.salary || "",
    app.jobType || "",
    app.applicationDate || "",
    app.deadline || "",
    app.priority || "",
    app.notes || "",
    app.jobUrl || "",
  ]);

  // Insert data
  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Applications!A1:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    }
  );

  if (!updateResponse.ok) {
    const error = await updateResponse.json().catch(() => ({}));
    throw new Error(`Failed to insert data: ${error.error?.message || updateResponse.statusText}`);
  }

  // Format header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                },
              },
              fields: "userEnteredFormat(textFormat,backgroundColor)",
            },
          },
        ],
      }),
    }
  );

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}
