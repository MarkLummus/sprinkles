// The machines table's seed (D-13; Mark's decide-equipment-process-scope and
// decide-whynter-max-fill). One machine, the Whynter, with the 700 g minimum
// fill the app's notes give. Mark fills the maximum in later, so maxFillG is
// null; nothing reads either limit yet. The shape is { id, name, minFillG,
// maxFillG, order }, keyed by id (store/seedTables.js validateMachineRow).
export const MACHINE_ROWS = [{ id: 'whynter', name: 'Whynter', minFillG: 700, maxFillG: null, order: 1 }];
