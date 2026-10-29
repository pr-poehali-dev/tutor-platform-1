import { FeedArticle as FeedArticleType } from "@/components/feed/types";
import FeedArticleDefaultCta from "./FeedArticleDefaultCta";
import FeedArticleServiceCtas from "./FeedArticleServiceCtas";
import FeedArticleGrantCtas from "./FeedArticleGrantCtas";
import FeedArticleTagCtas from "./FeedArticleTagCtas";
import { getFeedCtaFlags } from "./feedCtaFlags";

interface Props {
  article: FeedArticleType;
}

export default function FeedArticleCtas({ article }: Props) {
  const {
    isForecast,
    isSchoolBuilder,
    isGrantAi,
    isTurnkey,
    isRadar,
    isMatAnalytics,
    isMatDatabases,
    isMatBi,
    isMatPipes,
    matCta,
    isWriting,
    isGrantAiTeam,
    isGrantAiHiring,
    hasSpecial,
  } = getFeedCtaFlags(article);

  return (
    <>
      {!hasSpecial && <FeedArticleDefaultCta article={article} />}
      <FeedArticleServiceCtas
        article={article}
        isWriting={isWriting}
        isMatAnalytics={isMatAnalytics}
        isMatPipes={isMatPipes}
        isMatBi={isMatBi}
        isMatDatabases={isMatDatabases}
        matCta={matCta}
        isRadar={isRadar}
        isTurnkey={isTurnkey}
      />
      <FeedArticleGrantCtas
        article={article}
        isGrantAi={isGrantAi}
        isGrantAiTeam={isGrantAiTeam}
        isGrantAiHiring={isGrantAiHiring}
      />
      <FeedArticleTagCtas
        article={article}
        isForecast={isForecast}
        isSchoolBuilder={isSchoolBuilder}
      />
    </>
  );
}
