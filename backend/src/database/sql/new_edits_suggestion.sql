SET FOREIGN_KEY_CHECKS = 0;

RENAME TABLE Edit to Edit_Old;

--
-- Table structure for table Edit
--

CREATE TABLE Edit (
  IdInteraction int(11) NOT NULL,
  idEdit int(11) NOT NULL,
  idEntryType int(11) NOT NULL,
  mode varchar(25) varchar(25) NOT NULL DEFAULT 'normal',
  isCorrect tinyint(1) NOT NULL DEFAULT 2,
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table Edit
--
ALTER TABLE Edit
  ADD PRIMARY KEY (idEdit),
  ADD KEY idInteraction_index_adfhj126 (IdInteraction),
  ADD KEY _fk_idEntryType_from_edit_asllhg1233 (idEntryType);

--
-- AUTO_INCREMENT for table `Edit`
--
ALTER TABLE `Edit`
  MODIFY `idEdit` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for table Edit
--
ALTER TABLE Edit
  ADD CONSTRAINT _fk_idEntryType_from_edit_asllhg1233 FOREIGN KEY (idEntryType) REFERENCES EntryType (idEntryType),
  ADD CONSTRAINT _fk_idInteraction_from_edit_asdlhg1235 FOREIGN KEY (IdInteraction) REFERENCES Interaction (idInteraction);


--
-- Table structure for table Edit_Suggestion
--

CREATE TABLE Edit_Suggestion (
  idEdit int(11) NOT NULL,
  idSuggestion int(11) NOT NULL,
  isPrevSuggestion tinyint(1) NOT NULL,
  isNew tinyint(1) NOT NULL,
  isChosen tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Edit_Suggestion`
--
ALTER TABLE `Edit_Suggestion`
  ADD UNIQUE KEY `_unique_edit_suggestion_idEdit_agsdh1872dg` (`idEdit`,`idSuggestion`),
  ADD KEY `_index_edit_suggestion_idEdit_agsdh1872dg` (`idEdit`);
  ADD KEY `_index_edit_suggestion_idSuggestion_agsdh1872dg` (`idSuggestion`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table Edit_Suggestion
--
ALTER TABLE Edit_Suggestion
  ADD CONSTRAINT _fk_idEdit_from_Edit_Sugg_asdkl123 FOREIGN KEY (idEdit) REFERENCES Edit (idEdit),
  ADD CONSTRAINT _fk_idSuggestion_from_Edit_Sugg_asdkl123 FOREIGN KEY (idSuggestion) REFERENCES Suggestions (idSuggestion);

SET FOREIGN_KEY_CHECKS = 1;