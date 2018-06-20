library(sp)
library(rgdal)
library(RColorBrewer)
library(here)
library(classInt)
library(grid)
library(tools)

dn <- "Documents/Projects/sfvote"
precincts <- readOGR(here(dn, "data/2017lines"),
                     layer="SF_DOE_Precincts_2017")
votes <- read.csv(here(dn, "data/mayor_rcv_final_vote.csv"), strip.white=T)

# We could have more than the top two candidates plus "EXHAUSTED"; if so, give up.
stopifnot(length(unique(votes$candidate)) == 3)
tbl <- table(votes$candidate)
winner <- names(which.max(tbl))
second <- names(tbl)[which(names(tbl) != winner & names(tbl) != "EXHAUSTED")]

# Compute the percentage of votes the winning candidate got for each precinct.
percent_of_precinct_for_winner <- function(pct) {
  total <- length(which(votes$precinct == pct & votes$candidate != "EXHAUSTED"))
  length(which(votes$precinct == pct & votes$candidate == winner))/total
}
votes_pct <- data.frame(precinct=unique(votes$precinct),
                        percent=sapply(unique(votes$precinct), percent_of_precinct_for_winner))
votes_pct$precinct <- as.character(votes_pct$precinct)

# Convert precincts labeled "XXXX/YYYY" to two precincts; remove precincts labeled "XXXX MB"
# to play nicely with the spatial data.
for (i in 1:nrow(votes_pct)) {
  pct <- votes_pct$precinct[i]
  if (is.na(pct)) {
    next
  }
  if (grepl("/", pct)) {
    votes_pct$precinct[i] <- strsplit(as.character(pct), "/")[[1]][1]
    rbind(votes_pct, data.frame(precinct=strsplit(as.character(pct), "/")[[1]][2],
                                percent=votes_pct$percent[i]))
  }
  if (grepl("MB", votes_pct$precinct[i])) {
    votes_pct$precinct[i] <- strsplit(as.character(pct), " ")[[1]][1]
  }
}

# Compress the percentages a bit so we get more info in the middle range,
votes_pct$percent[which(votes_pct$percent > 0.8)] <- 0.799999
votes_pct$percent[which(votes_pct$percent < 0.2)] <- 0.200001

dt <- merge(precincts, votes_pct, by.x="PREC_2017", by.y="precinct")
breaks <- classIntervals(dt@data$percent, style="fixed", n=length(seq(0.2, 0.8, by=0.05)),
                         fixedBreaks=seq(0.2, 0.8, by=0.05), intervalClosure="right")
# purple, grey, green
palette <- colorRampPalette(colors=c("#4c0080", "#f2f2f2", "#004d00"))(length(breaks$brks)-1)

# Change labels to reflect a percentage > 50% for either candidate and have the final bucket
# say "75%+".
labels <- sprintf("%.0f%%", 100*ifelse(breaks$brks > 0.5, breaks$brks, 1-breaks$brks))
labels[1] <- ""
labels[length(labels)] <- ""
labels[2] <- paste(labels[2], "+", sep="")
labels[length(labels)-1] <- paste(labels[length(labels)-1], "+", sep="")

pdf(here(dn, "plots/precinct_vote_share_rcv_final.pdf"))
spplot(dt, "percent",
       lwd=2,
       cuts=length(breaks$brks)-1,
       col.regions=palette,
       par.settings=list(axis.line=list(col="transparent"),
                         layout.heights=list(bottom.padding=5)),
       at=breaks$brks,
       colorkey=list(space="bottom", labels=list(at=breaks$brks, labels=labels, font=2)),
       main="RCV final round vote split by precinct")
grid.text(toTitleCase(tolower(strsplit(second, " ")[[1]][2])),
          x=unit(0.1, "npc"), y=unit(0.03, "npc"), gp=gpar(fontface="bold"))
grid.text(toTitleCase(tolower(strsplit(winner, " ")[[1]][2])),
          x=unit(0.9, "npc"), y=unit(0.03, "npc"), gp=gpar(fontface="bold"))
dev.off()