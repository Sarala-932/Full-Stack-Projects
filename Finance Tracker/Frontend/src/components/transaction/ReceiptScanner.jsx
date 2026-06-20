import {useRef, useEffect, useState} from "react";
import {Camera, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import useFetch from "@/hooks/useFetch";
import {scanReceipt} from "@/services/transaction.api";

export function ReceiptScanner({onScanComplete}) {
    const fileInputRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);

    const {
        fn: scanReceiptFn,
        data: scannedData,
        setData,
    } = useFetch(scanReceipt);

    const handleReceiptScan = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setData(undefined);
        setIsScanning(true);
        try {
            await scanReceiptFn(file);
        } finally {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        if (scannedData && !isScanning) {
            if (scannedData.success) {
                onScanComplete(scannedData.data);
                toast.success("Receipt scanned successfully");
            }
        }
    }, [isScanning, scannedData]);

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReceiptScan(file);
                    // Reset input so the same file can be selected again
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }}
            />
            <Button
                type="button"
                variant="outline"
                className="w-full h-10 cursor-pointer bg-linear-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
            >
                {isScanning ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        <span>Scanning Receipt...</span>
                    </>
                ) : (
                    <>
                        <Camera className="mr-2" />
                        <span>Scan Receipt with AI</span>
                    </>
                )}
            </Button>
        </div>
    );
}
