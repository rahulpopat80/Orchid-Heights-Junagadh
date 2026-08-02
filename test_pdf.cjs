const jsPDF = require('jspdf');
const doc = new jsPDF.jsPDF();
doc.text('આભાર', 10, 10);
doc.save('test.pdf');
