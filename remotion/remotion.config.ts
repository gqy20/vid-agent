import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// 用系统已装的 Chrome，跳过 ~150MB 的 Headless Shell 下载
Config.setBrowserExecutable('/opt/google/chrome/chrome');
