export const demoProduct = {
  herb: {
    id: "DEMO-AYU-001",
    name: "Ashwagandha Root Powder",
    description: "Single-origin Ashwagandha root, tested for identity and purity before formulation.",
    origin: "Nagaur, Rajasthan, India",
    status: "ready",
    created_at: "2026-10-12T09:30:00.000Z"
  },
  certificate: {
    available: true,
    type: "Demo Certificate of Analysis",
    certificate_number: "COA-AYU-2026-001",
    tested_on: "2026-10-18",
    result: "Passed identity, moisture, and microbiology checks"
  },
  journey: [
    { role: "Farmer", name: "Ramesh Patel", place: "Nagaur, Rajasthan", completed_at: "2026-10-12" },
    { role: "Gatherer", name: "Meera Singh", place: "Jodhpur Collection Hub", completed_at: "2026-10-14" },
    { role: "Tester", name: "Dr. Kavya Shah", place: "AyuPure Laboratory", completed_at: "2026-10-18" },
    { role: "Manufacturer", name: "Veda Wellness Pvt. Ltd.", place: "Jaipur", completed_at: "2026-10-23" }
  ],
  customer: { name: "Ananya Sharma", message: "Demo customer verification record." },
  source: "demo"
};
