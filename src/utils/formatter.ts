export function formatTokenAmount(amount: number): string {
    return amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
} 