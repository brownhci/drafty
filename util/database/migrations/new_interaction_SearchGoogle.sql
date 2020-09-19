-- --------------------------------------------------------

--
-- Table structure for table SearchGoogle
--

CREATE TABLE SearchGoogle (
  IdInteraction int(11) NOT NULL,
  idUniqueID int(11) NOT NULL,
  idSuggestion int(11) NOT NULL,
  searchValues varchar(3000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table SearchGoogle
--
ALTER TABLE SearchGoogle
  ADD UNIQUE KEY IdInteraction (IdInteraction),
  ADD KEY _fk_idSuggestion_SearchGoogle_a645das (idSuggestion),
  ADD KEY _fk_idUniqueID_SearchGoogle_a645das (idUniqueID);

--
-- Constraints for dumped tables
--

--
-- Constraints for table SearchGoogle
--
ALTER TABLE SearchGoogle
  ADD CONSTRAINT _fk_idInteraction_SearchGoogle_a645das FOREIGN KEY (IdInteraction) REFERENCES Interaction (idInteraction),
  ADD CONSTRAINT _fk_idSuggestion_SearchGoogle_a645das FOREIGN KEY (idSuggestion) REFERENCES Suggestions (idSuggestion),
  ADD CONSTRAINT _fk_idUniqueID_SearchGoogle_a645das FOREIGN KEY (idUniqueID) REFERENCES UniqueId (idUniqueID);

INSERT INTO InteractionType (idInteractionType, interaction) VALUES (NULL, 'searchGoogle');