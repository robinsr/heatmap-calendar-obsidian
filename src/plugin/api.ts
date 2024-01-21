import { IEntry } from "../model/Entry.js";


export interface ColorOptions {
  [index: string | number]: string[]
}

export interface IntensitySettings {
  intensityScaleStart?: number;
  intensityScaleEnd?: number;
  defaultEntryIntensity?: number;
}

export interface InstanceSettings extends IntensitySettings {
  year?: number,
  rolling?: boolean,
  colors: ColorOptions,
  entries: IEntry[]
  showCurrentDayBorder: boolean
}

export interface PluginSettings {
  startDayOfWeek: number;
}

export interface Api extends InstanceSettings, PluginSettings {}
