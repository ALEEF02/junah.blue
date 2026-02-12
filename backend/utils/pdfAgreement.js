import PDFDocument from 'pdfkit';

export const buildAgreementPdfBuffer = async ({ agreement, beat, template }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('Junah Licensing Agreement', { align: 'left' });
    doc.moveDown();

    doc.fontSize(12).text(`Agreement ID: ${agreement._id}`);
    doc.text(`Beat: ${beat.title}`);
    doc.text(`License Type: ${agreement.templateType}`);
    doc.text(`Buyer Name: ${agreement.buyerName}`);
    doc.text(`Buyer Email: ${agreement.buyerEmail}`);
    doc.text(`Signed At: ${new Date(agreement.signedAt).toISOString()}`);
    doc.text(`Template Version: ${agreement.templateVersion}`);
    doc.text(`Template Hash: ${agreement.templateHash}`);

    doc.moveDown();
    doc.fontSize(14).text(template.title);
    doc.moveDown(0.5);
    doc.fontSize(10).text(template.fullText, {
      align: 'left'
    });

    doc.end();
  });
