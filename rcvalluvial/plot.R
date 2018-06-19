library(here)
library(ggplot2)
library(ggalluvial)

dn <- "Documents/Projects/sfvote"
grcvuq <- read.csv(here(dn,"data/mayor_rcv_v1_ggalluvial.csv"), header=T)
grcvuq$number <- grcvuq$number/1000

# Remove the labels of tiny candidates (they'll be too small for their boxes), and
# first/third-place votes (redundant info).
remove_unwanted_labels <- function(x) {
  total_votes <- sum(x$number)
  for (ca in unique(x$candidate)) {
    if (sum(x$number[which(x$candidate == ca)]) < (total_votes/1000)) {
      x$candidate[which(x$candidate == ca)] <- ""
    }
  }
  x$candidate[which(x$rank != 2)] <- ""
  x
}

ggplot(grcvuq, aes(x=rank, stratum=candidate, alluvium=id, weight=number, fill=candidate, label=candidate)) +
  geom_flow(alpha=0.75) +
  geom_stratum(alpha = 0.75) +
  geom_text(data=remove_unwanted_labels, stat = "stratum", size = 3) +
  labs(title="Vote rank breakdown", x="Rank", y="Number of votes (thousands)") +
  scale_x_discrete(limits=c(1,2,3)) +
  theme(legend.position="none") +
  theme(plot.title=element_text(hjust = 0.5, face="bold", size=16)) +
  theme(axis.title.x=element_text(face="bold", size=16)) +
  theme(axis.title.y=element_text(face="bold", size=16))
ggsave(here(dn, "plots/rcv_alluvial.pdf"), device="pdf", width = 10, height = 10, dpi = 120)