library(rgdal)
library(RColorBrewer)
library(here)
library(classInt)
library(tools)

dn <- "Documents/Projects/sfvote"
precincts <- readOGR(here(dn, "data/2017lines"),
                     layer="SF_DOE_Precincts_2017")
firsts <- read.csv(here(dn, "ballotimage/mayor_rcv_v1_precinct_firsts.csv"), strip.white=T)

pct_of_precinct <- function(i) {
  total <- sum(firsts$count[which(firsts$precinct == firsts$precinct[i])])
  firsts$count[i]/total
}

firsts$percent <- sapply(1:nrow(firsts), pct_of_precinct)

precinct_first_plot <- function(pct, df, candidate) {
  canddf <- df[which(df$candidate == candidate),]
  dt <- merge(pct, canddf, by.x="PREC_2017", by.y="precinct")
  dt@data$percent[which(is.na(dt@data$percent))] <- 0.0
  breaks <- classIntervals(dt@data$percent, n=9, style="pretty", intervalClosure="right")
  palette <- brewer.pal(n=9, name = "BuPu")
  palette <- colorRampPalette(palette)(length(breaks$brks))
  
  if (candidate == "NONE") {
    candidate <- "Abstain"
  }
  spplot(dt, "percent",
         lwd=2,
         cuts=length(breaks$brks),
         col.regions=palette,
         par.settings=list(axis.line=list(col="transparent")),
         at=breaks$brks,
         colorkey=list(labels=list(at=breaks$brks, labels=sprintf("%.0f%%", 100*breaks$brks), font=2)),
         main=paste(toTitleCase(tolower(candidate)), " first-place vote share", sep=""))
}

save_precinct_first_plot <- function(pct, df, candidate, basepath) {
  pdf(paste(basepath, "/plots/precinct_vote_share_", gsub(" ", "", candidate), ".pdf", sep=""))
  print(precinct_first_plot(pct, df, candidate))
  dev.off()
}

sapply(unique(firsts$candidate), function(c) save_precinct_first_plot(precincts, firsts, c, here(dn)))