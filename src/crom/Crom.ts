/*
{
  searchUsers(
    query: "Grom"
    filter: { anyBaseUrl: "http://scp-wiki-de.wikidot.com/" }
  ) {
    name
    authorInfos {
      authorPage {
        url
      }
    }
    statistics {
      rank
      totalRating
      meanRating
      pageCount
    }
  }
}
*/

/*

{
  searchPages(
    query: "SCP-013-DE"
    filter: { anyBaseUrl: "http://scp-wiki-de.wikidot.com" }
  ) {
    url
    wikidotInfo {
      title
      rating
    }
    alternateTitles {
      type
      title
    }
    translationOf {
      wikidotInfo {
        title
        rating
      }
    }
  }
}

*/

import { request, gql } from 'graphql-request'
import { BranchURLs } from './BranchURLs'

const DB_URL = "https://api.crom.avn.sh/graphql";

export class Crom {
    public static async searchPage(query: String, branch: String) {
        return (await request(DB_URL, gql`
        {
            searchPages(
                query: "${query}"
                filter: { ${BranchURLs.meta.includes(branch) ? `anyBaseUrl: "`+BranchURLs.abbr[branch as any]+`"` : ``} }
            ) {
                __typename
                url
                wikidotInfo {
                    title
                    rating
                    createdBy {
                        name
                        wikidotInfo { wikidotId }

                        authorInfos {
                          site
                          authorPage { url }
                        }
                    }
                }

                alternateTitles {
                    type
                    title
                }

                translationOf {
                    wikidotInfo {
                        title
                        rating
                    }
                }
            }
        }`)).searchPages;
    }

    public static async searchUser(query: String, branch: String) {
        return (await request(DB_URL, gql`{
            searchUsers(
                query: "${query}"
                filter: { ${BranchURLs.meta.includes(branch) ? `anyBaseUrl: "`+BranchURLs.abbr[branch as any]+`"` : ``} }
            ) {
                __typename
                name
                wikidotInfo { wikidotId }
                authorInfos {
                    authorPage {
                        url
                    }
                }

                statistics {
                    rank
                    totalRating
                    meanRating
                    pageCount
                }
            }
        }`)).searchUsers;
    }
}