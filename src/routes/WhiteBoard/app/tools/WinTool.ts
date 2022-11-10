import {ElementBase} from "../element/ElementBase";

export type WinToolType = "changeBackgroundColor" | "changeStrokeColor" | "changeStrokeWidth"
     | "changeFontSize" | "changeFontStyle" | "changeTextAlign"
     | "changeElementOpacity" | "changeElementPosition" | "operations"
// 二级的暂时写在这里
export type StrokeWidthType = "sStroke" | "mStroke" | "lStroke"
export type FontSizeType = "sFont" | "mFont" | "lFont"
export type FontStyleType = "bold" | "italic" | "underline"
export type TextAlignType = "left" | "center" | "right"
export type ElementPositionType = "toTop" | "toBottom" | "toNext" | "toLast"
export type OperationsType = "copy" | "delete"