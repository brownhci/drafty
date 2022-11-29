UPDATE users.Experiment t SET t.active = 0 WHERE t.idExperiment = 1;
UPDATE users.Experiment t SET t.active = 0 WHERE t.idExperiment = 3;
ALTER TABLE Experiment ADD max int default 0 not null;
INSERT INTO users.Experiment (experiment, active, dataset, max) VALUES ('dce_pilot', 1, 'csprofessors', 10);
