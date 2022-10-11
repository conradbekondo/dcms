import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dump, load } from 'js-yaml';
import { join } from 'path';
import { Configuration, defaultConfiguration } from './config.interface';

const configPath = join(process.env.RESOURCE_PATH, 'config.yml');

@Injectable()
export class ConfigService {
    private internalConfig: Configuration;
    constructor() {
        if (existsSync(configPath)) this.internalConfig = load(readFileSync(configPath, 'utf-8')) as any;
        else {
            this.internalConfig = { ...defaultConfiguration };
            writeFileSync(configPath, Buffer.from(dump(this.internalConfig), 'utf-8'));
        }
    }

    get config(): Configuration {
        return { ...this.internalConfig };
    }

    updateConfig(config: Configuration) {
        this.internalConfig = { ...config };
        writeFileSync(configPath, Buffer.from(dump(this.internalConfig), 'utf-8'));
    }
}
