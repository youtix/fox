#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { load } from 'js-yaml';
import { generateConfigs } from './services/configuration/configuration.service';
import { info } from './services/logger/logger.service';
import { templatePath, unknownArgs } from './services/parameters/parameters.service';
import { runWorkers } from './services/worker/worker.service';
import { parseArgs } from './utils/args/args.utils';

const data = readFile(templatePath, 'utf-8');
const args = parseArgs(unknownArgs);
if (!args.strategy) throw new Error('Override strategy via CLI is required');

const argsConfigs = generateConfigs(args);

const template = load(await data);
if (!template) throw new Error('Template file is not valid or not found');

await runWorkers(argsConfigs, template);

info('Fox backtested all configurations !');
