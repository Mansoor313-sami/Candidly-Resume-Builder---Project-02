/**
 * Client-side PDF export.
 *
 * We rasterize the on-screen resume "paper" with html2canvas and place it into
 * a jsPDF A4 document. If the resume is taller than one page, the image is
 * sliced across multiple A4 pages. Because we capture the exact DOM the user
 * sees, the PDF is pixel-faithful to the live preview and the selected
 * template — no separate PDF layout to maintain.
 *
 * Libraries are imported dynamically so they never run during SSR and are only
 * downloaded when the user actually exports.
 */
export async function exportResumePdf(node: HTMLElement, filename = "resume.pdf") {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Render the node at 2x for crisp text.
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth(); // 210mm
  const pageH = pdf.internal.pageSize.getHeight(); // 297mm
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  if (imgH <= pageH) {
    pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
  } else {
    // Paint the full-height image and shift it up one page at a time.
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
    heightLeft -= pageH;
    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pageH;
    }
  }

  pdf.save(filename);
}
