declare module "react-simple-maps" {
  import { ReactNode, CSSProperties } from "react";

  export interface ComposableMapProps {
    children?: ReactNode;
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      translate?: [number, number];
    };
    width?: number;
    height?: number;
    style?: CSSProperties;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    children: (props: { geographies: any[] }) => ReactNode;
    geography: string | object;
    parseGeographies?: (features: any) => any[];
  }

  export const Geographies: React.FC<GeographiesProps>;

  type StyleDictionary = {
    [key: string]: any;
  };

  export interface GeographyProps {
    geography: any;
    onMouseEnter?: (evt: React.MouseEvent<any>) => void;
    onMouseLeave?: () => void;
    onClick?: (evt: React.MouseEvent<any>) => void;
    style?: {
      default?: StyleDictionary;
      hover?: StyleDictionary;
      pressed?: StyleDictionary;
    };
  }

  export const Geography: React.FC<GeographyProps>;

  export interface ZoomableGroupProps {
    children?: ReactNode;
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (evt: any) => void;
    onMove?: (evt: any) => void;
    onMoveEnd?: (evt: any) => void;
  }

  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  export interface MarkerProps {
    children?: ReactNode;
    coordinates: [number, number];
  }

  export const Marker: React.FC<MarkerProps>;
}
