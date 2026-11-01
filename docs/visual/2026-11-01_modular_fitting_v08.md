# QuRa — correction of accessory fit, v08

v07 was rejected by the owner because hats, scarves, glasses, clothing and bags were still misregistered. v08 fits the existing approved art to per-character anatomical landmarks instead of positioning catalogue images by their outer bounds.

The 29 changed worn layers use scalp contact lines for headwear, optical centers for glasses, shoulder/chest/hem controls for garments, and the forward right flank for bags. Soldier bandana tails and Rainbow scarf ends are separated behind the head; the monk forehead symbol follows the face axis and the bead arc follows the base of the neck. Character identities, 24 expression sources, separate torso/wings and exclusive bare-leg/footwear modules remain in place.

The Figma masters were updated in place. [Large head review](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg/?node-id=193-1563) and [18 pose instances](https://www.figma.com/design/pTm5JOM8r7b8ukBrk3UsXg/?node-id=164-488) expose the actual fitted layers. Six character pages point to v08. This is a revised delivery for owner review, not owner-approved art.

Validation: all 209 main PNGs decoded at their declared dimensions and RGBA mode; 18 compositions and 30 head states were reviewed. The actual Figma soldier and monk rigs and the 18-pose board were inspected after fixing the import/display problems. The final 29-layer Figma state has no missing node references. PNG exports retain the common 1200 × 1520 registration canvas; shop art remains 768 × 768.

Implementation: `tools/art/modular-v08/build_v08.py` records similarity and thin-plate-spline landmark transforms, headwear front/back masks, and bag registration. The deliverable archive includes the v07 wearable inputs used by the script. `landmarks-v08.json` coordinates use the actual 600 × 760 design canvas (multiply both axes by 2 for PNG; no extra y offset).
