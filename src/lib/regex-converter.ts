export interface IRegexConverter {
    textOnly(text?: string | null): string;
    isKoreanLanguageOnly(text?: string | null): boolean;
    isEnglishLanguageOnly(text?: string | null): boolean;
    isChineseLanguageOnly(text?: string | null): boolean;
    escapeTZCharacter(text?: string | null): string;
}

export class RegexConverter implements IRegexConverter {
    textOnly = (text?: string | null) => {
        if (!text) {
            return '';
        }
        let check_kor = /[^a-zA-Zㄱ-힣\u119E\u11A2]/gi;
        return text.replace(check_kor, '');
    };
    isKoreanLanguageOnly = (text?: string | null) => {
        if (!text) {
            return true;
        }
        let check_reg = /^[ㄱ-ㅎ|가-힣\s0-9{\}\[\]\/?.,;:|\)<>*~`!^\-_+@&\#%\\\=\(]*$/i;
        return check_reg.test(text);
    };
    isEnglishLanguageOnly = (text?: string | null) => {
        if (!text) {
            return true;
        }
        let check_reg = /^[a-zA-Z\s0-9{\}\[\]\/?.,;:|\)<>*~`!^\-_+@&\#%\\\=\(]*$/i;
        return check_reg.test(text);
    };
    isChineseLanguageOnly = (text?: string | null) => {
        if (!text) {
            return true;
        }
        let check_reg = /^[一-龥\s0-9{\}\[\]\/?.,;:|\)<>*~`!^\-_+@&\#%\\\=\(]*$/i;
        return check_reg.test(text);
    };
    escapeTZCharacter = (text?: string | null) => {
        if (!text) {
            return '';
        }
        return text.slice(0, 19).replace('T', ' ');
    };
}
