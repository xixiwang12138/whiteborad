import {ElementType} from "../../routes/WhiteBoard/app/element/ElementBase";
import {EllipseElement, RectangleElement} from "../../routes/WhiteBoard/app/element/GenericElement";
import {Arrow, Line} from "../../routes/WhiteBoard/app/element/Line";
import {FreeDraw} from "../../routes/WhiteBoard/app/element/FreeDraw";
import {Constructor} from "./DataLoader";
import {TextElement} from "../../routes/WhiteBoard/app/element/TextElement";


export function elementTypeInterceptor(data:any):Constructor {
    switch (data.type) {
        case ElementType.generic:
            if(data.genericType === "ellipse") return EllipseElement;
            else return RectangleElement;
        case ElementType.linear:
            if(data.linearType === "line") return Line;
            else return Arrow;
        case ElementType.freedraw:
            return FreeDraw;
        case ElementType.text:
            return TextElement;
    }
}
