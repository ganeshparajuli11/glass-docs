# Skill: Browser PDF Engine

Use for PDF parsing/transformation work.

Procedure:

1. define typed operation contract;
2. validate files/options;
3. choose supported adapter;
4. place heavy work in a worker;
5. support cancellation/progress;
6. generate output bytes;
7. reopen and semantically validate output;
8. clean buffers/object URLs;
9. test standard and adversarial fixtures;
10. document exact limitations.

Never add an unreviewed WASM binary or claim encryption/OCR/compression capability without evidence.
