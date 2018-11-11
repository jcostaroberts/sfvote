library(rgdal)
library(viridis)
library(here)
library(classInt)

dn <- "Documents/Projects/sfvote/data"

districts <- readOGR(here(dn, "2017lines"),
                     layer="SF_BOS_20120702_nowater")

turnout <- read.csv(here(dn, "20181106_turnout_by_district.csv"))
turnout$Pct_Voted <- turnout$Voted/turnout$Registered
turnout$BOS_District <- as.factor(sprintf("%02d", turnout$BOS_District))

dt <- merge(districts, turnout, by.x="DISTRICT", by.y="BOS_District")

breaks <- classIntervals(dt@data$Pct_Voted, n=9, style="pretty", intervalClosure="right")
palette <- colorRampPalette(c("#FFFFCC", "gold1", "orangered2", "#660000"))(13)
#palette <- c("#FFFFF0", viridis_pal(direction=-1, option="A")(12)[1:11])
layout <- sapply(1:11,
                 function(x) list("sp.text",
                                  coordinates(dt)[x,],
                                  as.numeric(dt@data$DISTRICT[x]), font=2),
                 simplify=F)
spplot(dt, "Pct_Voted",
       lwd=2,
       cuts=12,
       col.regions=palette,
       sp.layout=layout,
       par.settings=list(axis.line=list(col="transparent")),
       at=breaks$brks,
       colorkey=list(labels=list(at=breaks$brks, labels=sprintf("%02d%%",
                                                                as.integer(100*breaks$brks)),
                                 font=2)),
       main="Voter turnout by district, November 2018")