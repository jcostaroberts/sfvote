library(rgdal)
library(RColorBrewer)
library(here)
library(classInt)

dn <- "GDrive/Sync/Projects/sfvote"

districts <- readOGR(here(dn, "data/2017lines"),
                     layer="SF_BOS_20120702_nowater")

turnout <- read.csv(here(dn, "turnoutsmaps/2014-11_turnout_by_district.csv"))
turnout$Pct_Voted <- turnout$Voted/turnout$Registered
turnout$BOS_District <- as.factor(sprintf("%02d", turnout$BOS_District))

dt <- merge(districts, turnout, by.x="DISTRICT", by.y="BOS_District")

breaks <- classIntervals(dt@data$Pct_Voted, n=9, style="pretty", intervalClosure="right")
palette <- brewer.pal(n=9, name = "YlOrRd")
palette <- c("#FFFFF5", palette) # RColorBrewer only gives us nine buckets. Add a tenth.
layout <- sapply(1:11,
                 function(x) list("sp.text",
                                  coordinates(dt)[x,],
                                  as.numeric(dt@data$DISTRICT[x]), font=2),
                 simplify=F)
spplot(dt, "Pct_Voted",
       lwd=2,
       cuts=9,
       col.regions=palette,
       sp.layout=layout,
       par.settings=list(axis.line=list(col="transparent")),
       at=breaks$brks,
       colorkey=list(labels=list(at=breaks$brks, labels=sprintf("%02d%%", 100*breaks$brks), font=2)),
       main="Voter turnout by district, November 2014")
