import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';

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

  const invoiceDate = order.orderDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  
  // Calculations
  const qty = order.quantity || 1;
  const rate = order.unitPrice || 0;
  const originalTotal = qty * rate;
  const discountAmount = order.discountPercentage > 0 ? (originalTotal * order.discountPercentage) / 100 : 0;
  const amountAfterDiscount = originalTotal - discountAmount;
  
  // Find product to get the brand and GST rate
  const product = products?.find(p => p.id === order.productId);
  const mfrName = product?.brand?.toUpperCase() || '-';
  
  // Dynamic GST Calculation — uses product's gst_rate field (0, 5, 12, 18, 28)
  // Pharmaceutical products in India are typically taxed at 12% GST
  // gstRate of 0 means tax-exempt (e.g., unbranded generic medicines)
  const gstRate = product?.gstRate ?? 0;  // fallback to 0% if not set on product
  
  // Calculate GST amounts from the post-discount subtotal
  // If GST-inclusive pricing: taxable = amount / (1 + rate/100)
  // Here we treat prices as GST-exclusive (i.e., GST is added on top) — change to 'inclusive' below if needed
  const gstAmount = Number(((amountAfterDiscount * gstRate) / 100).toFixed(2));
  const cgstPayable = Number((gstAmount / 2).toFixed(2));
  const sgstPayable = Number((gstAmount / 2).toFixed(2));
  
  const subTotal = amountAfterDiscount;
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
      
      {/* Navigation & Action Bar - responsive and sticky-like on top */}
      <div className="w-full max-w-[1000px] no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-4 mt-2 sm:mt-4 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-sm z-20">
        <button 
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Portal
        </button>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Share on WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
            Print GST Invoice
          </button>
        </div>
      </div>

      {/* Invoice Sheet Wrapper (horizontal scroll container for mobile screens) */}
      <div className="w-full overflow-x-auto pb-12 pt-4 px-4 sm:px-0 flex justify-start md:justify-center print:overflow-visible print:p-0 print:m-0">
        <div className="w-[1000px] min-w-[1000px] print:w-full print:min-w-0 border border-black relative text-[12px] leading-tight flex flex-col h-auto min-h-[800px] print:min-h-[240mm] print:mx-auto bg-white text-black shadow-lg print:shadow-none">

          {/* Top Section */}
          <div className="flex border-b border-black">
            {/* Left Top */}
            <div className="w-[60%] p-2 border-r border-black">
              <h1 className="text-xl font-bold uppercase tracking-wide">The Jangareddigudem Medical Agencies</h1>
              <p className="mt-1">BATTINAVARI STREET,</p>
              <p>JANAGAREDDIGUDEM - 534447</p>
              <p className="mt-1">Phone : 9440103869</p>
            </div>
            {/* Right Top */}
            <div className="w-[40%] p-2">
              <h2 className="text-[13px] font-bold">M/s {order.userName?.toUpperCase() || 'RETAILER'}</h2>
              <p className="mt-1">{order.deliveryAddress?.city?.toUpperCase() || 'JANGAREDDYGUDEM'}</p>
              {order.deliveryAddress?.phone && <p>Ph.No.: {order.deliveryAddress.phone}</p>}
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex border-b border-black">
            <div className="w-[30%] p-2 border-r border-black flex flex-col justify-end">
              <p>GSTIN : 37AEJPK1583R1ZQ</p>
            </div>
            <div className="w-[40%] p-2 border-r border-black flex items-center justify-center">
              <h2 className="text-2xl font-bold tracking-widest uppercase">GST Invoice</h2>
            </div>
            <div className="w-[30%] p-2">
              <div className="grid grid-cols-[80px_1fr] gap-1">
                <span>GST:</span><span></span>
                <span>Invoice No.</span><span>: {order.id.split('-').pop().toUpperCase()}</span>
                <span>Date</span><span>: {invoiceDate}</span>
                <span>BILL TYPE</span><span>: CREDIT</span>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="invoice-grid border-b border-black invoice-table-header font-bold text-center bg-gray-50">
            <div>Sn.</div>
            <div>Qty.</div>
            <div>Free</div>
            <div className="text-left">Item Name & Packing</div>
            <div>Batch</div>
            <div>Exp.</div>
            <div>MFR</div>
            <div>Mrp</div>
            <div>Rate</div>
            <div>Dis</div>
            <div>SGST</div>
            <div>CGST</div>
            <div>Amount</div>
          </div>

          {/* Table Body (Flex grow to push footer down) */}
          <div className="flex-1 flex flex-col">
            <div className="invoice-grid invoice-table-row border-b border-black">
              <div className="text-center pt-2">1.</div>
              <div className="text-center pt-2">{order.quantity}</div>
              <div className="text-right pt-2">{order.freeUnits > 0 ? order.freeUnits.toFixed(2) : '0.00'}</div>
              <div className="pt-2 font-semibold">{order.productName?.toUpperCase()}</div>
              <div className="text-center pt-2 font-mono text-[10px]">{product?.batch || '-'}</div>
              <div className="text-center pt-2">{product?.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/') : '-'}</div>
              <div className="text-center pt-2 truncate px-1" title={mfrName}>{mfrName}</div>
              <div className="text-right pt-2">{order.unitPrice?.toFixed(2)}</div>
              <div className="text-right pt-2">{order.unitPrice?.toFixed(2)}</div>
              <div className="text-right pt-2">{order.discountPercentage > 0 ? order.discountPercentage.toFixed(2) : '0.00'}</div>
              <div className="text-right pt-2">{sgstPayable.toFixed(2)}</div>
              <div className="text-right pt-2">{cgstPayable.toFixed(2)}</div>
              <div className="text-right pt-2">{(amountAfterDiscount + gstAmount).toFixed(2)}</div>
            </div>
            {/* Empty rows to fill space can be added here if needed, but flex-1 will stretch this container */}
            <div className="invoice-grid invoice-table-row flex-1">
              <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-t border-black p-1 font-semibold text-[11px]">
            Bank Details: BANK OF BARODA, A/C NO. 82390400000280, IFSC CODE: BARB0VJJAWG
          </div>

          {/* Totals Section */}
          <div className="border-t border-black flex">
            {/* GST Summary Table */}
            <div className="w-[70%] border-r border-black flex flex-col">
              <div className="gst-grid border-b border-black font-semibold text-center uppercase text-[10px]">
                <div>CLASS</div>
                <div>TOTAL</div>
                <div>SCH.</div>
                <div>DISC.</div>
                <div>SGST</div>
                <div>CGST</div>
                <div>TOTAL GST</div>
              </div>
              {[
                { label: 'GST 0%',   rate: 0  },
                { label: 'GST 5.0%', rate: 5  },
                { label: 'GST 12.0%',rate: 12 },
                { label: 'GST 18%',  rate: 18 },
                { label: 'GST 28%',  rate: 28 },
              ].map(({ label, rate: rowRate }) => {
                const isThisRow = rowRate === gstRate;
                const rowSgst = isThisRow ? sgstPayable.toFixed(2) : '0.00';
                const rowCgst = isThisRow ? cgstPayable.toFixed(2) : '0.00';
                const rowTotal = isThisRow ? (amountAfterDiscount).toFixed(2) : '0.00';
                const rowDisc  = isThisRow ? discountAmount.toFixed(2) : '0.00';
                const rowGst   = isThisRow ? gstAmount.toFixed(2) : '0.00';
                return (
                  <div key={label} className="gst-grid border-b border-black text-right text-[11px]">
                    <div className="text-left">{label}</div>
                    <div>{rowTotal}</div>
                    <div>0.00</div>
                    <div>{rowDisc}</div>
                    <div>{rowSgst}</div>
                    <div>{rowCgst}</div>
                    <div>{rowGst}</div>
                  </div>
                );
              })}
              <div className="gst-grid font-bold text-right text-[11px]">
                <div className="text-left">TOTAL</div>
                <div>{amountAfterDiscount.toFixed(2)}</div>
                <div>0.00</div>
                <div>{discountAmount.toFixed(2)}</div>
                <div>{sgstPayable.toFixed(2)}</div>
                <div>{cgstPayable.toFixed(2)}</div>
                <div>{gstAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Grand Totals */}
            <div className="w-[30%] text-[11px]">
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">SUB TOTAL</span><span>{originalTotal.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">Discount</span><span>{discountAmount.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">SGST PAYBLE</span><span>{sgstPayable.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">CGST PAYBLE</span><span>{cgstPayable.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">CR/DR NOTE</span><span>0.00</span></div>
              <div className="flex justify-between border-b border-black p-1"><span className="uppercase">Round off</span><span>{roundOff}</span></div>
              <div className="flex justify-between p-1 font-bold text-[13px]"><span className="uppercase">GRAND TOTAL</span><span>{grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-black flex text-[11px]">
            <div className="w-[70%] p-1 border-r border-black flex flex-col justify-between">
              <p className="italic underline">Rs. {grandTotal} only.</p>
              <div className="mt-4">
                <p className="font-bold underline italic">Terms & Conditions</p>
                <p>Goods once sold will not be taken back or exchanged.</p>
                <p>Bills not paid due date will attract 24% interest.</p>
              </div>
            </div>
            <div className="w-[15%] p-1 border-r border-black flex items-end justify-center">
              <span className="font-bold pb-2">Reciver</span>
            </div>
            <div className="w-[15%] p-1 flex items-end justify-center text-center">
              <span className="font-bold text-[9px] pb-2">For THE JANGAREDDIGUDEM MEDICAL AGENCIES</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
