import { Complex, evaluate} from "mathjs";

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
    console.log(`Result of "${content}": ${math_res}`);
    return math_res;
}