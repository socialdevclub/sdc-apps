import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportToPdfOptions {
  filename?: string;
  quality?: number;
  margin?: number;
  backgroundColor?: string;
}

export const exportToPdfMultiPage = async (elementId: string, options: ExportToPdfOptions = {}): Promise<void> => {
  const { filename = 'portfolio-report.pdf', quality = 1, margin = 10, backgroundColor = '#ffffff' } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // HTML 요소를 캔버스로 변환
    const canvas = await html2canvas(element, {
      allowTaint: true,
      backgroundColor,
      logging: false,
      scale: quality,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');

    // PDF 문서 생성 (A4 크기)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 여백을 고려한 실제 사용 가능한 크기
    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;

    // 캔버스 크기에 맞춰 PDF 이미지 크기 계산
    const imgWidth = availableWidth;
    const imgHeight = (canvas.height * availableWidth) / canvas.width;

    // 한 페이지에 들어갈 수 있는 높이
    const pageHeight = availableHeight;

    // 총 페이지 수 계산
    const totalPages = Math.ceil(imgHeight / pageHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // 현재 페이지에서 잘라낼 부분의 y 오프셋 계산
      const sourceY = page * pageHeight;
      const sourceHeight = Math.min(pageHeight, imgHeight - sourceY);

      // 캔버스에서 해당 부분만 잘라내기
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        // 페이지 캔버스 크기 설정
        pageCanvas.width = canvas.width;
        pageCanvas.height = (sourceHeight * canvas.width) / availableWidth;

        // 배경색 설정
        pageCtx.fillStyle = backgroundColor;
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // 원본 캔버스에서 해당 부분을 복사
        const sourceCanvasY = (sourceY * canvas.width) / availableWidth;
        const sourceCanvasHeight = (sourceHeight * canvas.width) / availableWidth;

        pageCtx.drawImage(
          canvas,
          0,
          sourceCanvasY,
          canvas.width,
          sourceCanvasHeight,
          0,
          0,
          pageCanvas.width,
          pageCanvas.height,
        );

        const pageImgData = pageCanvas.toDataURL('image/png');

        // PDF에 이미지 추가
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, sourceHeight);
      }
    }

    // PDF 다운로드
    pdf.save(filename);
  } catch (error) {
    console.error('PDF 내보내기 실패:', error);
    throw new Error('PDF 내보내기에 실패했습니다.');
  }
};
