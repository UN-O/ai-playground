// Components & UI
import { ClientComponent } from "./client"
import { ServerChild } from "./server-child"



/**
 * This page demonstrates the rendering of both Server and Client components.
 * The ClientComponent manages user interaction, while the ServerChild fetches data on the server side.
 * The components work together to show how server and client-side rendering can be combined in a Next.js application.
 */
export default function Page() {
    console.log("Server Page Render", Date.now())
    return (
        <div className="p-10 grid gap-5">
            <h1 className="text-2xl font-bold text-center">THIS IS MY SERVER PAGE</h1>
            <ClientComponent>
                <ServerChild />
            </ClientComponent>
        </div>
    );
}

/*
----------清除快取強制重新整理----------

Server Side Console:
    Server Page Render 1729346684110
    ClientComponent Render 1729346684160
    GOOD FETCH 1729346684330
    GET /rsc-lab 200 in 153ms
    GET /favicon.ico 200 in 11ms
Client Side Console:
    ClientComponent Render 1729346684971
    ClientComponent Render 1729346684971

-------------------------------------

-------------一般重新整理-------------

Server Side Console:
    Server Page Render 1729346992630
    GOOD FETCH 1729346992634
    ClientComponent Render 1729346992639
    GET /rsc-lab 200 in 81ms
    GET /favicon.ico 200 in 17ms
Client Side Console:
    ClientComponent Render 1729346993392
    ClientComponent Render 1729346993393

-------------------------------------

---------------按下按鈕---------------

Client Side Console:
    ClientComponent Buttom Click 1729347012972
    ClientComponent Render 1729347012973
    ClientComponent Render 1729347012973

-------------------------------------

------[Fast Refresh] rebuilding------

Server Side Console:
    ✓ Compiled in 409ms (1035 modules)
    Server Page Render 1729347203046
    GOOD FETCH 1729347203060

Client Side Console:
    [Fast Refresh] rebuilding
    [Fast Refresh] done in 510ms
    ClientComponent Render 1729347254595
    ClientComponent Render 1729347254596

-------------------------------------
*/