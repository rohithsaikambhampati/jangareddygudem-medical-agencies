import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

// Helper: Convert numbers to words (English numbering format)
function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function g(n) {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  function h(n) {
    if (n < 100) return g(n);
    const rest = n % 100;
    return a[Math.floor(n / 100)] + ' Hundred' + (rest ? ' and ' + g(rest) : '');
  }

  function convert(n) {
    if (n < 1000) return h(n);
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    return h(thousands) + ' Thousand' + (rest ? ' ' + h(rest) : '');
  }

  return convert(num);
}

// Helper: Convert DD-Mon-YYYY to DD-MM-YYYY
function formatInvoiceDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const mon = parts[1];
    const year = parts[2];
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const monthNum = months[mon] || mon;
    return `${day}-${monthNum}-${year}`;
  }
  return dateStr;
}

// Helper: Abbreviate brand names to fit in print grids without ellipsis dots
function abbreviateBrand(brand) {
  if (!brand) return '';
  const name = brand.trim().toUpperCase();
  if (name.length <= 5) return name;
  
  const mappings = {
    'PHARMACORP': 'PHRMC',
    'HEALTHLIFE': 'HLIFE',
    'MEDITECH': 'MTECH',
    'LIFEKIND': 'LFKND',
    'PHARMACEUTICALS': 'PHRMA',
    'LABORATORIES': 'LABS',
    'LABORATORY': 'LABS',
    'INDUSTRIES': 'IND',
    'CHEMICALS': 'CHEM',
  };
  
  if (mappings[name]) return mappings[name];
  
  const words = name.split(/\s+/);
  if (words.length > 1) {
    return words.map(w => {
      if (w === 'MEDICAL' || w === 'MEDICALS') return 'MED';
      if (w === 'AGENCIES' || w === 'AGENCY') return 'AGC';
      return w.slice(0, 3);
    }).join(' ').slice(0, 6).trim();
  }
  
  const firstChar = name[0];
  const rest = name.slice(1);
  const noVowels = rest.replace(/[AEIOU]/g, '');
  const shortened = (firstChar + noVowels).toUpperCase();
  
  if (shortened.length <= 5) return shortened;
  return shortened.slice(0, 5);
}

export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, products } = useProducts();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const order = orders.find(o => o.id === orderId);

  useEffect(() => {
    if (order) {
      // Allow fonts and layout to render before printing
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) {
    if (isInitializing || orders.length === 0) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold">Loading invoice data...</p>
          </div>
        </div>
      );
    }
    return <Navigate to="/" />;
  }

  const invoiceDate = formatInvoiceDate(order.orderDate);
  
  // Calculations
  const qty = order.quantity || 1;
  const rate = order.unitPrice || 0;
  const originalTotal = qty * rate;
  const discountAmount = order.discountPercentage > 0 ? (originalTotal * order.discountPercentage) / 100 : 0;
  const amountAfterDiscount = originalTotal - discountAmount;
  
  // Find product to get the brand and GST rate
  const product = products?.find(p => p.id === order.productId);
  const mfrName = product?.brand?.toUpperCase() || '-';
  const gstRate = product?.gstRate ?? 0;
  
  // GST calculations
  const cgstPayable = Math.floor(amountAfterDiscount * (gstRate / 2)) / 100;
  const sgstPayable = cgstPayable;
  const gstAmount = cgstPayable + sgstPayable;
  
  const grandTotal = Math.round(amountAfterDiscount + gstAmount);
  const roundOff = (grandTotal - (amountAfterDiscount + gstAmount)).toFixed(2);

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Hello ${order.userName || 'Retailer'}, here is your invoice from The Jangareddygudem Medical Agencies for Order #${order.id}. Invoice Total: Rs. ${grandTotal.toFixed(2)}. View or download it here: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen print:min-h-0 print:block bg-zinc-50 dark:bg-zinc-900 p-0 sm:p-4 print:p-0 print:m-0 font-sans flex flex-col items-center justify-start overflow-x-hidden">
      
      {/* Print custom styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 10mm 8mm;
            size: A4 portrait;
          }
          .invoice-sheet {
            border: 1px solid black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
          }
          .invoice-sheet table {
            border-color: black !important;
          }
          .invoice-sheet td, .invoice-sheet th {
            border-color: black !important;
            background-color: white !important;
            color: black !important;
          }
        }
        .invoice-sheet td, .invoice-sheet th {
          border-color: black !important;
        }
        .border-r-black { border-right: 1px solid black !important; }
        .border-b-black { border-bottom: 1px solid black !important; }
        .border-t-black { border-top: 1px solid black !important; }
        .border-l-black { border-left: 1px solid black !important; }
      `}} />

      {/* Navigation & Action Bar */}
      <div className="w-full max-w-[1000px] no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mt-2 sm:mt-4 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-md shadow-sm z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Portal
        </button>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-md font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Share on WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
            Print GST Invoice
          </button>
        </div>
      </div>

      {/* Invoice Sheet Wrapper */}
      <div className="w-full overflow-x-auto pb-12 pt-4 px-4 sm:px-0 flex justify-start md:justify-center print:overflow-visible print:p-0 print:m-0">
        <div className="invoice-sheet w-[1000px] min-w-[1000px] print:w-full print:min-w-0 border border-black relative text-black bg-white shadow-sm print:shadow-none p-0 flex flex-col">
          
          {/* HEADER SECTION TABLE */}
          <table className="w-full border-collapse border-l border-r border-t border-black text-[11px] leading-tight" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="p-2 border-r-black align-top" style={{ verticalAlign: 'top' }}>
                  <h1 className="text-[17px] font-black uppercase tracking-wide">THE JANAGAREDDIGUDEM MEDICAL AGENCIES</h1>
                  <p className="mt-1 font-semibold text-zinc-800">BATTINAVARI STREET,</p>
                  <p className="font-semibold text-zinc-800">JANAGAREDDIGUDEM - 534447</p>
                  <p className="mt-1 font-semibold text-zinc-800">D.L NO :20B&21B;13/AP/WG/E/2002/R</p>
                  <p className="font-semibold text-zinc-800">Phone : 9440103869</p>
                </td>
                <td className="p-2 align-top" style={{ verticalAlign: 'top' }}>
                  <h2 className="text-[13px] font-black uppercase">M/s {order.deliveryAddress?.name?.toUpperCase() || order.userName?.toUpperCase() || 'RETAILER'}</h2>
                  {order.deliveryAddress?.line1 && <p className="mt-1 font-semibold text-zinc-800">{order.deliveryAddress.line1.toUpperCase()}</p>}
                  <p className="font-semibold text-zinc-800">
                    {order.deliveryAddress?.city?.toUpperCase() || 'JANGAREDDYGUDEM'}
                    {order.deliveryAddress?.pin ? ` - ${order.deliveryAddress.pin}` : ' - 534447'}
                  </p>
                  <p className="font-semibold text-zinc-800">Ph.No.: {order.deliveryAddress?.phone || '9394079893,9394079893'}</p>
                  <p className="font-semibold text-zinc-800">D.L NO: {order.deliveryAddress?.dlNo || '116 * 116'}</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* HEADER ROW 2 (GSTIN / GST INVOICE / METADATA) */}
          <table className="w-full border-collapse border border-black text-[11px] leading-tight" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '48%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="p-2 border-r-black align-bottom font-bold text-[12px]" style={{ verticalAlign: 'bottom' }}>
                  GSTIN : 37AEJPK1583R1ZQ
                </td>
                <td className="p-2 border-r-black text-center align-middle" style={{ verticalAlign: 'middle' }}>
                  <h2 className="text-[18px] font-black tracking-wider uppercase text-zinc-950">GST INVOICE</h2>
                </td>
                <td className="p-0 align-top">
                  <div className="p-1 text-center font-bold border-b-black text-[11px]">GST:</div>
                  <div className="p-1.5 leading-snug">
                    <div className="grid grid-cols-[80px_1fr] text-[10.5px]">
                      <span className="font-bold text-zinc-800">Invoice No.</span><span className="font-semibold">: {order.id.split('-').pop().toUpperCase()}</span>
                      <span className="font-bold text-zinc-800">Date</span><span className="font-semibold">: {invoiceDate}</span>
                      <span className="font-bold text-zinc-800">BILL TYPE</span><span className="font-bold">: CREDIT</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ITEMS SECTION TABLE */}
          <table className="w-full border-collapse border-l border-r border-black text-[11px] leading-tight" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '3%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '7%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '4%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              {/* ITEMS TABLE HEADER ROW */}
              <tr className="border-b-black font-bold uppercase text-[9.5px] text-center" style={{ height: '24px' }}>
                <th className="border-r-black py-1">Sn.</th>
                <th className="border-r-black py-1">Qty.</th>
                <th className="border-r-black py-1">Free</th>
                <th className="border-r-black py-1 text-left px-2">Item Name & Packing</th>
                <th className="border-r-black py-1">Batch</th>
                <th className="border-r-black py-1">Exp.</th>
                <th className="border-r-black py-1">MFR</th>
                <th className="border-r-black py-1">Mrp</th>
                <th className="border-r-black py-1">Rate</th>
                <th className="border-r-black py-1">Dis</th>
                <th className="border-r-black py-1">SGST</th>
                <th className="border-r-black py-1">CGST</th>
                <th className="py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Active Product Line Item */}
              <tr className="align-middle text-zinc-900 text-center" style={{ height: '30px' }}>
                <td className="border-r-black py-1 text-center">1.</td>
                <td className="border-r-black py-1 font-bold">{order.quantity}</td>
                <td className="border-r-black py-1">{order.freeUnits > 0 ? order.freeUnits.toFixed(2) : '0.00'}</td>
                <td className="border-r-black py-1 text-left px-2 font-bold truncate max-w-0">{order.productName?.toUpperCase()}</td>
                <td className="border-r-black py-1 font-mono truncate max-w-0">{product?.batch || '2640078'}</td>
                <td className="border-r-black py-1">{product?.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }) : '12/27'}</td>
                <td className="border-r-black py-1 uppercase truncate max-w-0" title={mfrName}>{abbreviateBrand(mfrName)}</td>
                <td className="border-r-black py-1">{(order.unitPrice * 1.15).toFixed(2)}</td>
                <td className="border-r-black py-1">{order.unitPrice?.toFixed(2)}</td>
                <td className="border-r-black py-1">{order.discountPercentage > 0 ? order.discountPercentage.toFixed(2) : '0.00'}</td>
                <td className="border-r-black py-1">{(gstRate / 2).toFixed(2)}</td>
                <td className="border-r-black py-1">{(gstRate / 2).toFixed(2)}</td>
                <td className="py-1 font-bold text-right pr-2">{originalTotal.toFixed(2)}</td>
              </tr>

              {/* Blank Spacer Rows for Column Line Continuation */}
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={i} style={{ height: '24px' }}>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td className="border-r-black"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* BANK DETAILS BAR */}
          <div className="w-full border-t border-b border-l border-r border-black p-1.5 font-bold text-[11px] uppercase tracking-wide text-left bg-transparent">
            Bank Details: BANK OF BARODA, A/C NO. 82390400000280, IFSC CODE: BARB0VJJAWG
          </div>

          {/* FINANCIAL TOTALS SPLIT SECTION */}
          <table className="w-full border-collapse border-l border-r border-b border-black text-[11px]" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <tbody>
              <tr>
                {/* Left Half: GST Classes Summary */}
                <td className="p-0 border-r-black align-top" style={{ verticalAlign: 'top' }}>
                  <table className="w-full border-collapse text-right text-[10.5px]">
                    <thead>
                      <tr className="border-b-black font-bold text-center text-[10px]" style={{ height: '22px' }}>
                        <th className="border-r-black py-1 text-left px-1.5">CLASS</th>
                        <th className="border-r-black py-1">TOTAL</th>
                        <th className="border-r-black py-1">SCH.</th>
                        <th className="border-r-black py-1">DISC.</th>
                        <th className="border-r-black py-1">SGST</th>
                        <th className="border-r-black py-1">CGST</th>
                        <th className="py-1">TOTAL GST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'GST 0%',   rate: 0  },
                        { label: 'GST 5.0%', rate: 5  },
                        { label: 'GST 12.0%',rate: 12 },
                        { label: 'GST18%',   rate: 18 },
                        { label: 'GST 28%',  rate: 28 },
                      ].map(({ label, rate: rowRate }) => {
                        const isThisRow = rowRate === gstRate;
                        const rowSgst = isThisRow ? sgstPayable.toFixed(2) : '0.00';
                        const rowCgst = isThisRow ? cgstPayable.toFixed(2) : '0.00';
                        const rowTotal = isThisRow ? originalTotal.toFixed(2) : '0.00';
                        const rowDisc  = isThisRow ? discountAmount.toFixed(2) : '0.00';
                        const rowGst   = isThisRow ? gstAmount.toFixed(2) : '0.00';
                        return (
                          <tr key={label} className="border-b-black" style={{ height: '22px' }}>
                            <td className="border-r-black text-left px-1.5 font-bold">{label}</td>
                            <td className="border-r-black px-1">{rowTotal}</td>
                            <td className="border-r-black px-1">0.00</td>
                            <td className="border-r-black px-1">{rowDisc}</td>
                            <td className="border-r-black px-1">{rowSgst}</td>
                            <td className="border-r-black px-1">{rowCgst}</td>
                            <td className="px-1">{rowGst}</td>
                          </tr>
                        );
                      })}
                      <tr className="font-black bg-zinc-50/50" style={{ height: '24px' }}>
                        <td className="border-r-black text-left px-1.5">TOTAL</td>
                        <td className="border-r-black px-1">{originalTotal.toFixed(2)}</td>
                        <td className="border-r-black px-1">0.00</td>
                        <td className="border-r-black px-1">{discountAmount.toFixed(2)}</td>
                        <td className="border-r-black px-1">{sgstPayable.toFixed(2)}</td>
                        <td className="border-r-black px-1">{cgstPayable.toFixed(2)}</td>
                        <td className="px-1">{gstAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                {/* Right Half: Total calculations */}
                <td className="p-0 align-top" style={{ verticalAlign: 'top' }}>
                  <table className="w-full border-collapse text-[10.5px]">
                    <tbody>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">SUB TOTAL</td>
                        <td className="p-1 px-2 text-right font-semibold">{originalTotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">Discount</td>
                        <td className="p-1 px-2 text-right font-semibold">{discountAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">SGST PAYBLE</td>
                        <td className="p-1 px-2 text-right font-semibold">{sgstPayable.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">CGST PAYBLE</td>
                        <td className="p-1 px-2 text-right font-semibold">{cgstPayable.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">CR/DR NOTE</td>
                        <td className="p-1 px-2 text-right font-semibold">0.00</td>
                      </tr>
                      <tr className="border-b-black" style={{ height: '22px' }}>
                        <td className="p-1 px-2 font-bold text-left">Round off</td>
                        <td className="p-1 px-2 text-right font-semibold">{roundOff}</td>
                      </tr>
                      <tr className="font-black text-[13px]" style={{ height: '28px' }}>
                        <td className="p-1 px-2 text-left uppercase text-zinc-950">GRAND TOTAL</td>
                        <td className="p-1 px-2 text-right text-zinc-950">₹{grandTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER AREA */}
          <table className="w-full border-collapse border-l border-r border-b border-black text-[11px]" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="p-2 border-r-black align-top" style={{ height: '95px', verticalAlign: 'top' }}>
                  <div className="font-bold italic text-[11px] text-zinc-900 mb-4">
                    Rs. {numberToWords(grandTotal)} only
                  </div>
                  <div className="text-[9.5px] leading-snug text-zinc-800">
                    <span className="font-bold uppercase text-[9px] underline block mb-0.5">Terms & Conditions</span>
                    <p>Goods once sold will not be taken back or exchanged.</p>
                    <p>Bills not paid due date will attract 24% interest.</p>
                  </div>
                </td>
                <td className="p-2 border-r-black align-bottom text-center" style={{ height: '95px', verticalAlign: 'bottom' }}>
                  <span className="font-bold text-[10.5px] block pb-1">Reciver</span>
                </td>
                <td className="p-2 align-bottom text-center" style={{ height: '95px', verticalAlign: 'bottom' }}>
                  <div className="text-[7.5px] font-bold uppercase tracking-normaler text-zinc-950 text-right block mb-auto" style={{ lineHeight: '1' }}>
                    For THE JANAGAREDDIGUDEM MEDICAL AGENCIES
                  </div>
                  <div className="font-bold text-[10px] text-zinc-950 block pt-1.5 mt-12 text-center border-t border-gray-400">
                    Authorised Signatory
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}
