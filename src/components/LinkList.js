import React, {Component} from 'react'
import Link from './Link'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
    subscription {
        newLink {
            node {
                id
                url
                description
                createdAt
                postedBy {
                    id
                    name
                }
                votes {
                    id
                    user {
                        id
                    }
                }
            }
        }
    }
`

class LinkList extends Component {
    _updateCacheAfterVote = (store, createVote, linkId) => {
        const data = store.readQuery({query: FEED_QUERY})

        const votedLink = data.feed.links.find(link => link.id === linkId)
        votedLink.votes = createVote.link.votes

        store.writeQuery({query: FEED_QUERY, data})
    };

    _subscribetoNewLinks = subscribeToMore => {
        subscribeToMore({
            document: NEW_LINKS_SUBSCRIPTION,
            updateQuery: (prev, {subscriptionData}) => {
                if (!subscriptionData.data) return prev
                const newLink = subscriptionData.data.newLink.node

                return Object.assign({}, prev, {
                    feed: {
                        links: [newLink, ...prev.feed.links],
                        count: prev.feed.links.length + 1,
                        __typename: prev.feed.__typename
                    }
                })
            }
        })
    };

    _subscribeToNewVotes = subscribeToMore => {
        subscribeToMore({
            document: NEW_VOTES_SUBSCRIPTION
        })
    } ;

    render() {
        return (
            <query query={FEED_QUERY}>
                {({loading, error, data, subscribeToMore}) => {
                    if (loading) return <div> Fetching </div>
                    if (error) return <div> Error </div>

                    this._subscribetoNewLinks(subscribeToMore)
                    this._subscribeToNewVotes(subscribeToMore)

                    const linksToRender = data.feed.links

                    return (
                        <div>
                            {linksToRender.map((link, index) => (
                                <Link
                                    key={link.id}
                                    link={link}
                                    index={index}
                                    updateStoreAfterVote={this._updateCacheAfterVote}
                                />
                            ))}
                        </div>
                    )
                }}
            </query>
        )
    }
}

export const FEED_QUERY = gql`
    # 2
    query FeedQuery {
        feed {
            links {
                id
                createdAt
                url
                description
                postedBy {
                    id
                    name
                    }
                votes {
                    id
                    user {
                        id
                    }
                  }
                }
              }
            }
          `

export default graphql(FEED_QUERY, {name:'feedQuery'}) (LinkList)
