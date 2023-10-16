export default function(value: number): string {
    const arabicNumbers = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
    return String(value).replace(/[0123456789]/g, (d) => arabicNumbers[Number(d)]);
}