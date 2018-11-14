dn <- "Documents/Projects/sfvote/data"
summary <- read.csv(here(dn, "20181111_sf_vote_summary.csv"))
measures <- summary[which(summary$contest_type == "local-measure"),]
measures$pct_yes <- measures$yes/(measures$yes + measures$no)
write.csv(measures, here(dn, "20181111_sf_measures_yes.csv"))
