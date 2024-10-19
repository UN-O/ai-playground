import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export async function ServerChild() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
            cache: "force-cache",
        })
        console.log("GOOD FETCH", Date.now())

        // 驗證 fetch 的回應狀態碼
        if (!res.ok) {
            throw new Error("Failed to fetch data");
        }

        const posts: Post[] = await res.json(); // 明確指定返回的資料結構

        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <Card key={post.id} className="p-4">
                        <CardHeader>
                            <CardTitle>{post.title}</CardTitle>
                            Post ID: {post.id}
                        </CardHeader>
                        <CardContent>
                            <p>{post.body}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );

    } catch (error) {
        console.error("Error fetching data:", error);
        return <p>Error fetching data</p>;
    }
}
