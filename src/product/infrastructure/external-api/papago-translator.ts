import axios from 'axios';

export interface IPapagoTranslator {
    translateToChinese(text: string): Promise<string>;
    translateToEnglish(text: string): Promise<string>;
}

export class PapagoTranslator implements IPapagoTranslator {
    translateToChinese(text: string) {
        return this.translate(text, 'ko', 'zh-CN');
    }
    translateToEnglish(text: string) {
        return this.translate(text, 'ko', 'en');
    }
    async translate(text: string, from: LanguageSource, to: LanguageSource) {
        const url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation';
        const apiKeyID = 'jyg05ensko';
        const apiKey = 'RJBSHQRezyWD7FtFk1RV8iLsiefSfoIuIQBHZGAM';
        const headers = {
            'X-NCP-APIGW-API-KEY-ID': apiKeyID,
            'X-NCP-APIGW-API-KEY': apiKey,
        };
        const source = from;
        const target = to;
        const response = await axios.post(url, {source, target, text}, {headers});
        return response.data.message.result.translatedText;
    }
}

type LanguageSource = 'ko' | 'zh-CN' | 'en';
