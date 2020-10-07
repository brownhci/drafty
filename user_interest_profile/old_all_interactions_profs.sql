--- sw for profs.sql - this takes 4 to 6 seconds to run

select s.idProfile AS idProfile,i.idSession AS idSession,exps.type AS experiment_type,i.idInteraction AS idInteraction,it.interaction AS interaction,i.timestamp AS timestamp,cs.idSuggestion AS click_idSuggestion,cs.suggestion AS click_suggestion,cst.name AS click_colName,cs.idUniqueID AS click_rowID,c.rowvalues AS click_rowValues,dcs.idSuggestion AS doubleClick_idSuggestion,dcs.suggestion AS doubleClick_suggestion,dcst.name AS doubleClick_colName,dcs.idUniqueID AS doubleClick_rowID,dc.rowvalues AS doubleClick_rowValues,sest.name AS search_columnName,se.value AS search_value,se.matchedValues AS search_matchedValues,sost.name AS sort_colName,e.edit_entryType AS edit_entryType,e.edit_rowID AS edit_rowID,e.edit_colName AS edit_colName,e.edit_suggestions AS edit_suggestions,e.edit_chosen AS edit_chosen,e.edit_new AS edit_new,e.edit_correct AS edit_correct

from ((((((((((((((Interaction i join InteractionType it on(it.idInteractionType = i.idInteractionType))

join Session s on(s.idSession = i.idSession))
left join (select es.idSession AS idSession,es.idExperiment AS idExperiment,exp.type AS type from (Experiment_Session es join Experiment exp on(exp.idExperiment = es.idExperiment)) group by es.idSession) exps on(exps.idSession = s.idSession))
left join (select eTemp.idInteraction AS idInteraction,eTemp.type AS edit_entryType,eTemp.idUniqueID AS edit_rowID,eTemp.name AS edit_colName,group_concat(eTemp.suggestion separator ',') AS edit_suggestions,group_concat(eTemp.chosen separator ',') AS edit_chosen,sum(eTemp.new) AS edit_new,sum(eTemp.correct) AS edit_correct from (select e1.idInteraction AS idInteraction,e1.idSuggestion AS idSuggestion,eet1.type AS type,e1.chosen AS chosen,e1.new AS new,e1.correct AS correct,es1.suggestion AS suggestion,es1.idUniqueID AS idUniqueID,est1.name AS name from (((Edit e1
left join Suggestions es1 on(es1.idSuggestion = e1.idSuggestion))
left join EntryType eet1 on(eet1.idEntryType = e1.idEntryType))
left join SuggestionType est1 on(est1.idSuggestionType = es1.idSuggestionType))) eTemp group by eTemp.idInteraction) e on(e.idInteraction = i.idInteraction))
left join Click c on(c.idInteraction = i.idInteraction))
left join Suggestions cs on(cs.idSuggestion = c.idSuggestion))
left join SuggestionType cst on(cst.idSuggestionType = cs.idSuggestionType))
left join DoubleClick dc on(dc.idInteraction = i.idInteraction))
left join Suggestions dcs on(dcs.idSuggestion = dc.idSuggestion))
left join SuggestionType dcst on(dcst.idSuggestionType = dcs.idSuggestionType))
left join Search se on(se.idInteraction = i.idInteraction))
left join SuggestionType sest on(sest.idSuggestionType = se.idSuggestionType))
left join Sort so on(so.idInteraction = i.idInteraction))
left join SuggestionType sost on(sost.idSuggestionType = so.idSuggestionType)) order by s.idProfile,i.idSession,i.timestamp desc ;