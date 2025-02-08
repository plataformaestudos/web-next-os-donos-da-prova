import { BoldOption } from "./bold-option.component";
import { BulletListOption } from "./bullet-list-option.component";
import { FontSizeOption } from "./font-size-option.component";
import { ItalicOption } from "./italic-option.component";
import { MathematicsOption } from "./mathematics-option.component";
import { OrderedListOption } from "./ordered-list-option.component";
import { UnderlineOption } from "./underline-option.component";
import { UploadImageOption } from "./upload-image-option.component";

export const optionGroups = [
  [<FontSizeOption key="font-size" />],
  [
    <BoldOption key="bold" />,
    <ItalicOption key="italic" />,
    <UnderlineOption key="underline" />,
  ],
  [
    <BulletListOption key="bullet-list" />,
    <OrderedListOption key="ordered-list" />,
  ],
  [<UploadImageOption key="upload-image" />],
  [<MathematicsOption key="mathematics" />],
];
