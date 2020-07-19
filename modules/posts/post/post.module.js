angular
    .module('postModule', ['ngRoute', 'commentsModule'])
    .config(['$routeProvider', function config($routeProvider) {
        $routeProvider
            .when('/post/:id', {
                template: '<post post="$resolve.post"></post>',
                resolve: {
                    post: function (PostRepository, $route) {
                        return PostRepository.getById($route.current.params.id);
                    },
                }
            })
        ;
    }])
    .factory('PostRepository', function PostRepository($http, BASE_API_URL) {
        return {
            getById: async (id) => {
                id = Number(id)
                return $http
                    .get(`${BASE_API_URL}/issues/${id}?state=open&sort=created`)
                    .then(response => {
                        const post = createPostFromIssue(response.data);
                        console.log(response.data)
                        console.log(post)

                        return post
                    })
            },
            getByFilter: async (filter) => {
                let url = `${BASE_API_URL}/issues`;
                url += '?sort=created'
                if (filter.state) {
                    url += '&state=' + filter.state
                }
                if (filter.limit) {
                    url += '&per_page=' + filter.limit
                }
                if (filter.offset) {
                    url += '&page=' + (filter.offset)
                }
                console.log(url)
                return $http
                    .get(url)
                    .then(response => {
                        const posts = createPostsFromIssueList(response.data);
                        console.log(response.data)
                        console.log('posts', posts)

                        return posts
                    })
            }
        };
    })
;

function PostRepositoryFilter(state, limit, offset) {
    return {
        state: state,
        limit: limit,
        offset: offset,
    }
}


function Post(id, title, body, author, tags, commentsCount, createdAt) {
    return {
        id: id,
        title: title,
        body: body,
        author: author,
        tags: tags,
        selfUrl: id,
        commentsCount: commentsCount,
        createdAt: createdAt,
    }
}

function Author(username, url, avatarUrl) {
    return {
        username: username,
        url: url,
        avatarUrl: avatarUrl,
    }
}

function createPostsFromIssueList(issueList) {
    return issueList.map(issue => createPostFromIssue(issue))
}
function createPostFromIssue(issue) {
    const author = new Author(issue.user.login, issue.user.html_url, issue.user.avatar_url);
    const tags = issue.labels.map((label) => label.name);

    return new Post(issue.number, issue.title, issue.body, author, tags, issue.comments, issue.created_at)
}