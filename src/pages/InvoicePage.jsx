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
  
  // Find product to get the brand for MFR column
  const product = products?.find(p => p.id === order.productId);
  const mfrName = product?.brand?.toUpperCase() || '-';
  
  // Calculate assumed GST for template (assuming 12% GST = 6% CGST + 6% SGST, backward calculated from total)
  // Let's just do a simple dummy calculation for the template
  const subTotal = amountAfterDiscount; 
  const grandTotal = Math.round(amountAfterDiscount);
  const roundOff = (grandTotal - amountAfterDiscount).toFixed(2);

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Hello ${order.userName || 'Retailer'}, here is your invoice from The Jangareddygudem Medical Agencies for Order #${order.id}. Invoice Total: Rs. ${grandTotal.toFixed(2)}. View or download it here: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen print:min-h-0 print:block bg-white text-black p-4 print:p-0 print:m-0 font-sans flex justify-center">
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 5mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; }
            .no-print { display: none !important; }
          }
          .invoice-grid {
            display: grid;
            grid-template-columns: 3% 4% 4% minmax(150px, 1fr) 8% 6% 9% 6% 6% 4% 5% 5% 8%;
          }
          .invoice-table-header > div, .invoice-table-row > div {
            padding: 4px;
            border-right: 1px solid #000;
          }
          .invoice-table-header > div:last-child, .invoice-table-row > div:last-child {
            border-right: none;
          }
          .gst-grid {
            display: grid;
            grid-template-columns: 80px 1fr 60px 60px 60px 60px 80px;
          }
          .gst-grid > div {
            padding: 2px 4px;
            border-right: 1px solid #000;
          }
          .gst-grid > div:last-child {
            border-right: none;
          }
        `}
      </style>

      <div className="w-full max-w-[1000px] border border-black relative text-[12px] leading-tight flex flex-col h-auto min-h-[800px] print:min-h-[240mm] print:mx-auto">
        {/* Back Button */}
        <div className="absolute -top-12 left-0 no-print flex gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="bg-zinc-200 text-zinc-800 px-4 py-2 rounded-lg font-bold shadow hover:bg-zinc-300 transition flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
        </div>

        {/* Action Buttons */}
        <div className="absolute -top-12 right-0 no-print flex gap-3">
          <button 
            onClick={handleWhatsAppShare}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            WhatsApp
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition"
          >
            Print GST Invoice
          </button>
        </div>

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
            <div className="text-right pt-2">0.00</div>
            <div className="text-right pt-2">0.00</div>
            <div className="text-right pt-2">{amountAfterDiscount.toFixed(2)}</div>
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
            {['GST 0%', 'GST 5.0%', 'GST 12.0%', 'GST 18%', 'GST 28%'].map((taxClass, idx) => (
              <div key={idx} className="gst-grid border-b border-black text-right text-[11px]">
                <div className="text-left">{taxClass}</div>
                <div>{idx === 0 ? amountAfterDiscount.toFixed(2) : '0.00'}</div>
                <div>0.00</div>
                <div>{idx === 0 ? discountAmount.toFixed(2) : '0.00'}</div>
                <div>0.00</div>
                <div>0.00</div>
                <div>0.00</div>
              </div>
            ))}
            <div className="gst-grid font-bold text-right text-[11px]">
              <div className="text-left">TOTAL</div>
              <div>{amountAfterDiscount.toFixed(2)}</div>
              <div>0.00</div>
              <div>{discountAmount.toFixed(2)}</div>
              <div>0.00</div>
              <div>0.00</div>
              <div>0.00</div>
            </div>
          </div>

          {/* Grand Totals */}
          <div className="w-[30%] text-[11px]">
            <div className="flex justify-between border-b border-black p-1"><span className="uppercase">SUB TOTAL</span><span>{originalTotal.toFixed(2)}</span></div>
            <div className="flex justify-between border-b border-black p-1"><span className="uppercase">Discount</span><span>{discountAmount.toFixed(2)}</span></div>
            <div className="flex justify-between border-b border-black p-1"><span className="uppercase">SGST PAYBLE</span><span>0.00</span></div>
            <div className="flex justify-between border-b border-black p-1"><span className="uppercase">CGST PAYBLE</span><span>0.00</span></div>
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
  );
}
