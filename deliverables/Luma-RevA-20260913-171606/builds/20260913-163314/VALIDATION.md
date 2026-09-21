# Validation record

- 105 model components and 4 host-reference parts measured.
- 109 parts rebuilt with one solid body each.
- 125 sketches inspected; 0 not fully constrained after anchoring.
- 0 nominal-envelope/body-count discrepancies at 0.15 mm tolerance.

The raw verifier log ends with an attempted read of a transient SolidWorks '~$' lock file. This is not a CAD part. All 109 real part files had already completed reopening, rebuilding, saving and measurement. The generator's file filter now excludes lock files; no real part was skipped.

Final assembly placement and collision results are in final-interferences.txt. The independent exploded assembly prevents its component offsets from propagating to installed configurations. Static model checks do not establish working strip transport, structural capacity, hygiene performance or clinical accuracy.

## Final static assembly check

- Partition_DC INTERFERENCE_COUNT=0
- Partition_Battery INTERFERENCE_COUNT=0
- Rail_DC INTERFERENCE_COUNT=0
- Rail_Battery INTERFERENCE_COUNT=0
- Hook_DC INTERFERENCE_COUNT=0
- Hook_Battery INTERFERENCE_COUNT=0
- Pedestal_DC INTERFERENCE_COUNT=0
- Pedestal_Battery INTERFERENCE_COUNT=0
- Smooth_DC INTERFERENCE_COUNT=0
- Smooth_Battery INTERFERENCE_COUNT=0
- Magnetic_DC INTERFERENCE_COUNT=0
- Magnetic_Battery INTERFERENCE_COUNT=0

Only static solid interference is assessed. This does not prove clearance throughout motion, mount load capacity or a functioning feed/eject mechanism.
