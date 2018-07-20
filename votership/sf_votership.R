library(ggplot2)

vote <- read.csv("~/Downloads/sf_vote_summary.csv")
vote$vote_rate <- vote$votes/vote$turnout

lm <- vote[which(vote$contest_type == "local-measure"),]
lm$pctyes <- (lm$yes/lm$votes)
lm$pctvote <- lm$votes/lm$turnout

# Census SF population estimates multiplied by estimated percetange of population 18+
pop <- rev(c(828816, 839280, 850424, 850424, 862004, 870887, 870887, 884363)*0.865)
lm$pop <- sapply(lm$date, function(x) pop[which(unique(lm$date) == x)])
lm$nonreg <- lm$pop - lm$registration
lm$nonvote <- lm$registration - lm$turnout
lm$avgvotes <- sapply(lm$date, function(x) mean(lm$votes[which(lm$date == x)]))
lm$skipped <- lm$turnout - lm$avgvotes

lmavg <- data.frame(date=unique(lm$date))
lmavg$avgvotes <- sapply(unique(lm$date), function(x) lm$avgvotes[which(lm$date == x)[1]])
lmavg$skipped <- sapply(unique(lm$date), function(x) lm$skipped[which(lm$date == x)[1]])
lmavg$nonvote <- sapply(unique(lm$date), function(x) lm$nonvote[which(lm$date == x)[1]])
lmavg$nonreg <- sapply(unique(lm$date), function(x) lm$nonreg[which(lm$date == x)[1]])
lmavg$pop <- sapply(unique(lm$date), function(x) lm$pop[which(lm$date == x)[1]])

# Create the ridiculous data.frame that ggplot needs
lmavgexp <- rbind(
  data.frame(date=unqdate, pct=100*lmavg$nonreg/lmavg$pop, type=rep("nonreg", length(unique(lm$date)))),
  data.frame(date=unqdate, pct=100*lmavg$nonvote/lmavg$pop, type=rep("novote", length(unique(lm$date)))),
  data.frame(date=unqdate, pct=100*lmavg$skipped/lmavg$pop, type=rep("skipped", length(unique(lm$date)))),
  data.frame(date=unqdate, pct=100*lmavg$avgvotes/lmavg$pop, type=rep("votes", length(unique(lm$date))))
)
lmavgexp$date <- sapply(lmavgexp$date, function(x) paste(substr(x, 1, 4), substr(x, 5, 6), substr(x, 7, 8), sep="-"))
lmavgexp$date <- as.factor(lmavgexp$date)

pdf(file="~/Downloads/sf_votership.pdf", width=9, height=6)
ggplot(lmavgexp, aes(fill=type, y=pct, x=date)) +
  geom_bar(stat="identity") +
  theme_minimal() +
  theme(axis.text.x=element_text(face="bold"), axis.text.y=element_text(face="bold")) +
  ggtitle("San Francisco local measure average votership by election, 2012-2018") +
  theme(plot.title=element_text(hjust=0.5, face="bold")) +
  ylab("Percentage of voting-age population") +
  xlab("Election") +
  theme(axis.title.x=element_text(face="bold")) +
  theme(axis.title.y=element_text(face="bold")) +
  theme(legend.title=element_blank()) +
  scale_fill_discrete(labels=c("Not registered", "Didn't vote", "Skipped measure", "Voted on measure")) +
  theme(legend.text=element_text(face="bold"))
dev.off()
