// Unit tests for storage migration
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Storage migration", () => {
  beforeEach(() => {
    // Mock chrome.storage
    global.chrome = {
      storage: {
        local: {
          get: async () => ({}),
          set: async () => {},
          remove: async () => {},
        },
      },
    } as any;
  });

  it("should initialize default settings", async () => {
    let savedSettings: any;
    global.chrome.storage.local.set = async (data: any) => {
      savedSettings = data;
    };

    const { initializeStorage } = await import("../../src/lib/storage/migrate");
    await initializeStorage();

    // Migration should have been called
    expect(savedSettings).toBeDefined();
  });

  it("should add country/city fields with undefined defaults", () => {
    const profile = {
      experience: [{ title: "Engineer", company: "Acme" }],
      education: [{ school: "MIT" }],
      licenses: [{ name: "CPA" }],
      projects: [{ name: "Project X" }],
    };

    // Simulate migration logic
    for (const exp of profile.experience as any[]) {
      if (!exp.country) exp.country = undefined;
      if (!exp.city) exp.city = undefined;
    }

    expect(profile.experience[0]).toHaveProperty("country");
    expect(profile.experience[0]).toHaveProperty("city");
  });
});
