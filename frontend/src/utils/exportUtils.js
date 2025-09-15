import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Export data to Excel/CSV
export const exportToExcel = (
  data,
  filename = 'analytics_data',
  sheetName = 'Data'
) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Auto-size columns
    const colWidths = [];
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, index) => {
        const maxLength = Math.max(
          key.length,
          ...data.map((row) => String(row[key] || '').length)
        );
        colWidths[index] = { wch: Math.min(maxLength + 2, 30) };
      });
    }
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

export const exportToCSV = (data, filename = 'analytics_data') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

// Export chart as image
export const exportChartAsImage = async (
  elementId,
  filename = 'chart',
  format = 'png'
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    canvas.toBlob((blob) => {
      saveAs(blob, `${filename}.${format}`);
    }, `image/${format}`);

    return true;
  } catch (error) {
    console.error('Error exporting chart as image:', error);
    return false;
  }
};

// Export dashboard as PDF
export const exportDashboardAsPDF = async (
  elementIds,
  filename = 'dashboard_report'
) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analytics Dashboard Report', pageWidth / 2, yPosition, {
      align: 'center'
    });

    // Add date
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    yPosition += 20;

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId);
      if (!element) continue;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if we need a new page
      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting dashboard as PDF:', error);
    return false;
  }
};

// Format data for export
export const formatDataForExport = (data, type) => {
  switch (type) {
    case 'revenue':
      return data.map((item) => ({
        Date: new Date(
          item._id.year,
          item._id.month - 1,
          item._id.day || 1
        ).toLocaleDateString(),
        Revenue: item.revenue || 0,
        Orders: item.orders || 0,
        'Average Order Value': item.avgOrderValue || 0,
        'Total Discount': item.totalDiscount || 0,
        'Total GST': item.totalGST || 0
      }));

    case 'products':
      return data.map((item) => ({
        'Product Name': item.productName || item.name,
        Price: item.productPrice || item.price,
        'Stock Available': item.stockavailable,
        'Total Quantity Sold': item.totalQuantitySold || item.totalsales || 0,
        'Total Revenue': item.totalRevenue || item.totalrevenue || 0,
        'Order Count': item.orderCount || 0,
        'Average Quantity Per Order': item.avgQuantityPerOrder || 0,
        Status: item.status ? 'Active' : 'Inactive'
      }));

    case 'customers':
      return data.map((item) => ({
        'Customer Name': item.customerName || item.name,
        Phone: item.customerPhone || item.phone,
        City: item.customerCity || item.city,
        State: item.state,
        'Total Orders': item.totalOrders || 0,
        'Total Spent': item.totalSpent || 0,
        'Average Order Value': item.avgOrderValue || 0,
        'First Order Date': item.firstOrderDate
          ? new Date(item.firstOrderDate).toLocaleDateString()
          : '',
        'Last Order Date': item.lastOrderDate
          ? new Date(item.lastOrderDate).toLocaleDateString()
          : ''
      }));

    case 'giftboxes':
      return data.map((item) => ({
        'Gift Box Name': item.giftBoxName || item.name,
        Price: item.giftBoxPrice || item.grandtotal,
        'Total Quantity Sold': item.totalQuantitySold || 0,
        'Total Revenue': item.totalRevenue || 0,
        'Order Count': item.orderCount || 0,
        Status: item.status ? 'Active' : 'Inactive'
      }));

    case 'inventory':
      return (data.products || []).map((item) => ({
        'Product Name': item.name,
        Price: item.price,
        'Stock Available': item.stockavailable,
        'Stock Status': item.stockStatus,
        'Total Value': item.totalValue,
        'Total Sales': item.totalsales || 0,
        'Total Revenue': item.totalrevenue || 0,
        Status: item.status ? 'Active' : 'Inactive'
      }));

    case 'geographic':
      return data.map((item) => ({
        City: item._id.city || 'Unknown',
        State: item._id.state || 'Unknown',
        'Order Count': item.orderCount,
        Revenue: item.revenue,
        'Unique Customers': item.uniqueCustomers
      }));

    case 'sales_trends':
      return data.map((item) => ({
        Hour: item._id.hour,
        'Day of Week': item._id.dayOfWeek,
        'Day of Month': item._id.dayOfMonth,
        Month: item._id.month,
        Year: item._id.year,
        'Order Count': item.orderCount,
        Revenue: item.revenue
      }));

    default:
      return data;
  }
};

// Generate summary statistics
export const generateSummaryStats = (data, metrics) => {
  const stats = {};

  metrics.forEach((metric) => {
    const values = data
      .map((item) => item[metric])
      .filter((val) => val !== null && val !== undefined);

    if (values.length > 0) {
      stats[metric] = {
        total: values.reduce((sum, val) => sum + val, 0),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }
  });

  return stats;
};

// Create comprehensive export with multiple sheets
export const exportComprehensiveReport = async (
  analyticsData,
  filename = 'comprehensive_analytics_report'
) => {
  try {
    const wb = XLSX.utils.book_new();

    // Revenue Analysis Sheet
    if (analyticsData.revenueAnalytics?.length > 0) {
      const revenueData = formatDataForExport(
        analyticsData.revenueAnalytics,
        'revenue'
      );
      const revenueWs = XLSX.utils.json_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(wb, revenueWs, 'Revenue Analysis');
    }

    // Product Analysis Sheet
    if (analyticsData.productAnalytics?.length > 0) {
      const productData = formatDataForExport(
        analyticsData.productAnalytics,
        'products'
      );
      const productWs = XLSX.utils.json_to_sheet(productData);
      XLSX.utils.book_append_sheet(wb, productWs, 'Product Analysis');
    }

    // Customer Analysis Sheet
    if (analyticsData.customerAnalytics?.length > 0) {
      const customerData = formatDataForExport(
        analyticsData.customerAnalytics,
        'customers'
      );
      const customerWs = XLSX.utils.json_to_sheet(customerData);
      XLSX.utils.book_append_sheet(wb, customerWs, 'Customer Analysis');
    }

    // Gift Box Analysis Sheet
    if (analyticsData.giftBoxAnalytics?.length > 0) {
      const giftBoxData = formatDataForExport(
        analyticsData.giftBoxAnalytics,
        'giftboxes'
      );
      const giftBoxWs = XLSX.utils.json_to_sheet(giftBoxData);
      XLSX.utils.book_append_sheet(wb, giftBoxWs, 'Gift Box Analysis');
    }

    // Inventory Analysis Sheet
    if (analyticsData.inventoryAnalytics) {
      const inventoryData = formatDataForExport(
        analyticsData.inventoryAnalytics,
        'inventory'
      );
      const inventoryWs = XLSX.utils.json_to_sheet(inventoryData);
      XLSX.utils.book_append_sheet(wb, inventoryWs, 'Inventory Analysis');
    }

    // Geographic Analysis Sheet
    if (analyticsData.geographicAnalytics?.length > 0) {
      const geoData = formatDataForExport(
        analyticsData.geographicAnalytics,
        'geographic'
      );
      const geoWs = XLSX.utils.json_to_sheet(geoData);
      XLSX.utils.book_append_sheet(wb, geoWs, 'Geographic Analysis');
    }

    // Summary Sheet
    const summaryData = [
      {
        Metric: 'Total Products',
        Value: analyticsData.inventoryAnalytics?.totalProducts || 0
      },
      {
        Metric: 'Total Inventory Value',
        Value: analyticsData.inventoryAnalytics?.totalInventoryValue || 0
      },
      {
        Metric: 'Low Stock Products',
        Value: analyticsData.inventoryAnalytics?.lowStockProducts || 0
      },
      {
        Metric: 'Out of Stock Products',
        Value: analyticsData.inventoryAnalytics?.outOfStockProducts || 0
      },
      {
        Metric: 'Total Customers',
        Value: analyticsData.customerAnalytics?.length || 0
      },
      {
        Metric: 'Total Revenue Items',
        Value: analyticsData.revenueAnalytics?.length || 0
      }
    ];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error creating comprehensive report:', error);
    return false;
  }
};
