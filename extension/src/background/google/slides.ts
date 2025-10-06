// Google Slides API integration
import { ensureAuth } from "./auth";
import type { ResumeProfile } from "../../lib/storage/schema";

export async function exportPortfolio(profile: ResumeProfile): Promise<string> {
  const token = await ensureAuth();

  // Create presentation
  const createResponse = await fetch("https://slides.googleapis.com/v1/presentations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `${profile.personal.firstName} ${profile.personal.lastName} - Portfolio`,
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json().catch(() => ({}));
    throw new Error(`Failed to create presentation: ${error.error?.message || createResponse.statusText}`);
  }

  const presentation = await createResponse.json();
  const presentationId = presentation.presentationId;

  // Build slides content
  const requests: any[] = [];

  // Title slide (already exists, just update it)
  const titleSlideId = presentation.slides[0]?.objectId;
  if (titleSlideId) {
    requests.push(
      {
        deleteText: {
          objectId: presentation.slides[0].pageElements[0]?.objectId,
          textRange: { type: "ALL" },
        },
      },
      {
        insertText: {
          objectId: presentation.slides[0].pageElements[0]?.objectId,
          text: `${profile.personal.firstName} ${profile.personal.lastName}`,
        },
      }
    );
  }

  // Add projects slide
  if (profile.projects.length > 0) {
    const projectSlideId = `project_slide_${Date.now()}`;
    requests.push({
      createSlide: {
        objectId: projectSlideId,
        slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
      },
    });

    // Add project details
    const projectsText = profile.projects
      .map((p) => `${p.name}\n${p.description || ""}`)
      .join("\n\n");

    requests.push({
      insertText: {
        objectId: `${projectSlideId}_title`,
        text: "Projects",
      },
    });
  }

  // Execute batch update
  if (requests.length > 0) {
    await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests }),
      }
    );
  }

  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
}
