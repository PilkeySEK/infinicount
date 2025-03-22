import { Complex, evaluate, isComplex} from "mathjs";

export function evalMessage(content: string): number | Complex | undefined {
    if(content.startsWith('`') && content.endsWith('`')) {
        content = content.substring(1, content.length - 1);
    }
    let math_res: number | Complex | undefined;
    try {
        math_res = evaluate(content);
    }
    catch(e) {
        math_res = undefined;
    }
    if(isComplex(math_res)) {
        const math_str = math_res.toString();
        if(!math_str.includes("i")) {
            console.log(`Converted Complex Number ${math_res} to number.`);
            math_res = parseInt(math_res.toString());
        }
    }
    console.log(`Result of "${content}": ${math_res}`);
    return math_res;
}