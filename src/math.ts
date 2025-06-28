import { Complex, evaluate, isComplex } from "mathjs";

// If a message matches these EXACTLY, don't count it
const exclusions = [":3", "s", "br", "e", "g", ";3", "{}", "[]", "V", "S", "E", "F", "J", "K", "L", "N", "W", "T", "b"]

export function evalMessage(content: string): number | Complex | undefined {
    if (content.startsWith('`') && content.endsWith('`')) {
        content = content.substring(1, content.length - 1);
    }
    let math_res: number | Complex | undefined;
    try {
        math_res = evaluate(content);
    }
    catch (e) {
        math_res = undefined;
    }
    const math_str = math_res == undefined ? "" : math_res.toString();
    if (isComplex(math_res)) {
        if (!math_str.includes("i")) {
            console.log(`Converted Complex Number ${math_res} to number.`);
            math_res = parseInt(math_res.toString());
        }
    }
    if (exclusions.includes(content)) return undefined;
    console.log(`Result of "${content}": ${math_res}`);
    return math_res;
}