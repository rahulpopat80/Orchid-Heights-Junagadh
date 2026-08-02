const fs = require('fs');

let code = fs.readFileSync('src/components/ChunkedMedia.tsx', 'utf8');

// Add variant and className to props
const propInterface = `interface ChunkedMediaProps {
  fileId: string;
  type: string;
  fallbackName: string;
  key?: any;
}`;
const newPropInterface = `interface ChunkedMediaProps {
  fileId: string;
  type: string;
  fallbackName: string;
  key?: any;
  variant?: 'default' | 'raw';
  className?: string;
}`;
code = code.replace(propInterface, newPropInterface);

// Update component signature
const signature = `export default function ChunkedMedia({ fileId, type, fallbackName }: ChunkedMediaProps) {`;
const newSignature = `export default function ChunkedMedia({ fileId, type, fallbackName, variant = 'default', className }: ChunkedMediaProps) {`;
code = code.replace(signature, newSignature);

// Update image rendering
const imageRenderTarget = `  if (type?.startsWith('image/')) {
    return (
      <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-1 w-full">
        <img
          src={mediaUrl}
          alt={fallbackName}
          className="w-full object-contain max-h-[220px] rounded-lg"
          referrerPolicy="no-referrer"
        />
        <div className="w-full flex items-center justify-between px-2 py-1.5 mt-1 border-t border-slate-100 bg-white rounded-b-lg">
          <span className="text-[9px] font-bold text-slate-500 truncate max-w-[140px]">{fallbackName}</span>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = mediaUrl;
              link.download = fallbackName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-indigo-600 hover:text-indigo-700 p-1 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold">Save</span>
          </button>
        </div>
      </div>
    );
  }`;

const newImageRender = `  if (type?.startsWith('image/')) {
    if (variant === 'raw') {
      return (
        <img
          src={mediaUrl}
          alt={fallbackName}
          className={className || "w-full h-full object-cover"}
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className={"rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50 flex flex-col items-center justify-center p-1 " + (className || "w-full")}>
        <img
          src={mediaUrl}
          alt={fallbackName}
          className="w-full object-contain max-h-[220px] rounded-lg"
          referrerPolicy="no-referrer"
        />
        <div className="w-full flex items-center justify-between px-2 py-1.5 mt-1 border-t border-slate-100 bg-white rounded-b-lg">
          <span className="text-[9px] font-bold text-slate-500 truncate max-w-[140px]">{fallbackName}</span>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = mediaUrl;
              link.download = fallbackName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="text-indigo-600 hover:text-indigo-700 p-1 flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold">Save</span>
          </button>
        </div>
      </div>
    );
  }`;
code = code.replace(imageRenderTarget, newImageRender);

// Update loading rendering
const loadingTarget = `  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-slate-50 border border-slate-150 rounded-xl min-h-[90px] w-full">
        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-2" />
        <span className="text-[10px] font-bold text-slate-500">Loading attachment...</span>
      </div>
    );
  }`;

const newLoadingTarget = `  if (loading) {
    if (variant === 'raw') {
      return (
        <div className={\`flex items-center justify-center bg-slate-100 \${className}\`}>
           <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-4 bg-slate-50 border border-slate-150 rounded-xl min-h-[90px] w-full">
        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-2" />
        <span className="text-[10px] font-bold text-slate-500">Loading attachment...</span>
      </div>
    );
  }`;
code = code.replace(loadingTarget, newLoadingTarget);

// Update error rendering
const errorTarget = `  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl min-h-[90px] w-full">
        <span className="text-[10px] font-bold">Failed to load attachment</span>
      </div>
    );
  }`;
const newErrorTarget = `  if (error) {
    if (variant === 'raw') {
      return (
        <div className={\`flex items-center justify-center bg-red-50 text-red-500 \${className}\`}>
           !
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl min-h-[90px] w-full">
        <span className="text-[10px] font-bold">Failed to load attachment</span>
      </div>
    );
  }`;
code = code.replace(errorTarget, newErrorTarget);

fs.writeFileSync('src/components/ChunkedMedia.tsx', code);
console.log("Updated ChunkedMedia.tsx successfully");
