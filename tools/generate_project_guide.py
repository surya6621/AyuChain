from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

OUTPUT = "AyuChain_Project_Guide.pdf"

GREEN = colors.HexColor("#155C43")
DEEP = colors.HexColor("#0D382B")
CLAY = colors.HexColor("#C76142")
SAGE = colors.HexColor("#E8F0E2")
INK = colors.HexColor("#193A2C")
MUTED = colors.HexColor("#647267")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=32, leading=38, textColor=DEEP, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["Normal"], fontName="Helvetica", fontSize=13, leading=19, textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Section", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=DEEP, spaceBefore=14, spaceAfter=9))
styles.add(ParagraphStyle(name="Subsection", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=GREEN, spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name="Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.2, leading=11, textColor=INK))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=15, textColor=DEEP, backColor=SAGE, borderColor=colors.HexColor("#B8CCB6"), borderWidth=0.6, borderPadding=10, spaceBefore=8, spaceAfter=12))

def p(text, style="Body"):
    return Paragraph(text, styles[style])

def section(title, lead=None):
    items = [p(title, "Section")]
    if lead:
        items.append(p(lead, "Callout"))
    return items

def bullet(text):
    return Paragraph("• " + text, styles["Body"])

def table(headers, rows, widths=None):
    data = [[Paragraph(f"<b>{h}</b>", styles["Small"]) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(value), styles["Small"]) for value in row])
    tbl = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C9D5C6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FAFCF8")),
    ]))
    return tbl

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#C9D5C6"))
    canvas.line(18 * mm, 16 * mm, 192 * mm, 16 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "AyuChain — project guide and implementation roadmap")
    canvas.drawRightString(192 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()

story = []
story += [Spacer(1, 38 * mm), p("AyuChain", "CoverTitle"), p("Blockchain-enabled Ayurvedic herb supply-chain platform", "CoverSub"), Spacer(1, 10 * mm), p("Project guide, current capabilities, user workflows, and next implementation plan", "CoverSub"), Spacer(1, 28 * mm)]
cover_table = Table([[p("<b>Purpose</b><br/>Build trust from farm to customer through verified traceability.", "Body"), p("<b>Current stack</b><br/>React, Node.js, Express, PostgreSQL, JWT, Multer, MetaMask-ready integration.", "Body")]], colWidths=[85 * mm, 85 * mm])
cover_table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), SAGE), ("BOX", (0, 0), (-1, -1), 0.8, GREEN), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 12)]))
story += [cover_table, Spacer(1, 18 * mm), p("Prepared for the AyuChain project workspace", "CoverSub"), PageBreak()]

story += section("1. What AyuChain does", "AyuChain makes every Ayurvedic herb batch traceable: a farmer registers it, workers move it through collection, laboratory testing, and manufacturing, and a customer can verify the final product using a QR code or printed batch number.")
story += [p("The project solves a practical trust problem. Customers often cannot see where an herbal product came from, whether it was tested, or who handled it. AyuChain records the supply-chain stages in a central backend today and is structured for future blockchain and IPFS integration."), p("The system is designed for mobile users and keeps the public customer experience simple: scan a QR code, or type a batch number, then view the product, origin, current stage, and available laboratory certificate.")]
story += section("2. Current working architecture")
story += [table(["Layer", "Technology", "Responsibility"], [["Frontend", "React + Vite", "Separate route-based dashboards, forms, QR scanning, translations, responsive layout"], ["Backend", "Node.js + Express", "REST APIs, JWT authentication, role authorization, uploads and public verification"], ["Database", "PostgreSQL / Neon", "Users, herb batches, laboratory reports, roles and workflow state"], ["Files", "Local uploads (current)", "PDF/JPG/PNG laboratory reports, limited to 10 MB"], ["Blockchain", "Hardhat + ethers (prepared)", "Future contract deployment, ownership records and proof-of-origin transactions"]], [30*mm, 43*mm, 97*mm]), Spacer(1, 8*mm)]
story += [p("The frontend reads the backend base URL from <b>VITE_API_URL</b> and defaults to <b>http://localhost:5000</b>. The backend reads <b>PORT</b>, <b>DATABASE_URL</b>, and <b>JWT_SECRET</b> from its environment file.")]

story += section("3. User roles and separate pages", "Each group has its own route and authorized workspace. A user cannot use another role’s protected API merely by changing the frontend URL.")
story += [table(["Role", "Main page", "What the person can do"], [["Administrator", "#/admin/login → #/admin", "View all people and batches, see role/status totals, manage user roles, refresh system data."], ["Farmer", "#/worker", "Register a new herb harvest with name, description, and origin."], ["Gatherer / Collector", "#/worker", "See registered batches and confirm collection."], ["Tester / Laboratory", "#/worker", "See collected batches and upload an approved PDF/JPG/PNG laboratory report up to 10 MB."], ["Manufacturer", "#/worker", "See laboratory-cleared batches, assign a manual customer-facing batch number, and approve the product."], ["Customer", "#/verify", "Use QR camera scanning or manual batch-number lookup; view product details and download reports when available."]], [32*mm, 43*mm, 95*mm])]

story += section("4. Supply-chain workflow")
story += [p("The intended workflow is deliberately sequential. This avoids a product being approved before the prior responsible party has completed work."), table(["Stage", "Responsible role", "System action", "Result"], [["registered", "Farmer", "Registers harvest", "Batch enters collector queue"], ["collected", "Gatherer", "Confirms collection", "Batch enters laboratory queue"], ["laboratory", "Tester", "Uploads report", "Report is stored; batch enters manufacturer queue"], ["manufacturing / laboratory", "Manufacturer", "Enters manual batch number", "Product is approved as ready"], ["ready", "Customer", "Scans QR or types batch number", "Public product record and certificate are displayed"]], [31*mm, 35*mm, 55*mm, 49*mm])]
story += [p("A product batch may be retrieved by its internal database ID during development or by its manufacturer-assigned manual code in production, such as <b>AYU-TULSI-2026-001</b>.", "Callout")]

story += section("5. API connections currently implemented")
story += [table(["Method", "Endpoint", "Purpose"], [["GET", "/", "Backend health response and database configuration status"], ["POST", "/api/auth/register", "Create a profile with name, email, password, and role"], ["POST", "/api/auth/login", "Login and receive JWT token"], ["GET", "/api/users/profile", "Read authenticated profile"], ["GET", "/api/admin/dashboard", "Protected admin totals and role/status summaries"], ["GET", "/api/admin/users", "Protected people directory"], ["PATCH", "/api/admin/users/:id/role", "Admin role update"], ["GET", "/api/admin/batches", "Protected all-batch list"], ["POST", "/api/herbs", "Farmer creates a herb batch"], ["GET", "/api/herbs/queue", "Role-specific working queue"], ["POST", "/api/herbs/:id/lab-report", "Laboratory uploads report; max 10 MB"], ["POST", "/api/herbs/:id/approve", "Manufacturer assigns a manual product batch number"], ["GET", "/api/herbs/public/:identifier", "Customer lookup by ID or manual batch number"]], [20*mm, 62*mm, 89*mm])]

story += section("6. What I can help you build next")
story += [bullet("Create a real Solidity smart contract for herb batches, role handoffs, and immutable transaction history."), bullet("Deploy the contract to Polygon Amoy and connect MetaMask with a chosen network and contract address."), bullet("Move certificates and herb images from local uploads to Pinata/IPFS, then store the IPFS CID with each batch."), bullet("Generate a printable QR code for every approved manual batch number."), bullet("Add Leaflet/OpenStreetMap farm and collection location views."), bullet("Add an audit-history table so every handoff, upload, approver, and timestamp is visible to customers and admins."), bullet("Improve security with admin invitation-only creation, password reset, input sanitization, upload malware scanning, and rate limiting."), bullet("Prepare deployment configuration for Vercel frontend and Render backend."), bullet("Write tests, API documentation, and a final demonstration presentation.")]

story += section("7. Important current limitations")
story += [p("The present blockchain folder still contains sample Hardhat contracts. The frontend can connect to a MetaMask wallet, but final herb batch transactions should not be described as on-chain until an AyuChain-specific contract is written, deployed, and connected."), p("Laboratory reports currently use local backend storage. For a production deployment, reports should be uploaded to IPFS/Pinata or durable object storage, with only the document hash/CID and public-safe metadata stored in PostgreSQL."), p("The existing project can register any role through the general registration form. A production platform should limit administrator creation to a secure invitation or database seed process.")]

story += section("8. How I can support you")
story += [p("I can continue as your implementation partner: inspect errors, connect frontend buttons to real APIs, add missing database tables and endpoints, create role-specific screens, make pages mobile-friendly, generate documents, write tests, and guide deployment. I will keep changes organized into separate components and services so you can find and edit each part easily."), p("For each next feature, tell me the result you want—for example, “add QR generation after manufacturer approval” or “deploy to Render”—and I can implement it, verify it, and explain how to use it."), Spacer(1, 8*mm), p("Recommended next step: add the audit history and QR generator, then connect the final contract to Polygon Amoy.", "Callout")]

doc = SimpleDocTemplate(OUTPUT, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=22*mm, title="AyuChain Project Guide", author="AyuChain")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUTPUT)
