import { describe, expect, it } from "vitest";
import { samplePage } from "@/lib/fixtures/samplePage";
import { validatePage } from "@/lib/schema/pageSchema";

describe("page schema", () => {
  it("accepts a valid page with known sections", () => {
    const result = validatePage(samplePage);

    expect(result.success).toBe(true);
  });

  it("rejects invalid required section props", () => {
    const result = validatePage({
      ...samplePage,
      sections: [
        {
          id: "broken-hero",
          type: "hero",
          props: {
            heading: "",
          },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("keeps unknown section data renderable as unsupported", () => {
    const result = validatePage({
      ...samplePage,
      sections: [
        {
          id: "unknown-section",
          type: "pricingTable",
          props: {
            heading: "Plans",
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.sections[0].type).toBe("pricingTable");
  });
});
